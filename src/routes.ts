import * as Boom from 'boom';
import { Request, ResponseToolkit, ServerRoute } from 'hapi';
import { assert } from 'hoek';
import * as Joi from 'joi';

import { getConnection } from './db';
import { Match } from './entity/Match';
import { Trueskill } from './entity/Trueskill';
import { heroStats } from './heroes';
import { server } from '.';
import { playerCompetition, playerMatches } from './playerMatches';
import { matchSkill } from './skill';
import stats from './stats';
import getTwitchStreams from './twitch';
import { getCache, client } from './redis';

const playerMatchRoute: ServerRoute = {
  path: '/playerMatches/{nickname}',
  method: 'GET',
  options: {
    cors: { origin: 'ignore' },
    validate: {
      params: {
        nickname: Joi.string()
          .min(1)
          .max(15)
          .lowercase(),
      },
    },
    response: {
      schema: {
        wins: Joi.number(),
        losses: Joi.number(),
        matches: Joi.array(),
        account_id: Joi.number(),
      },
    },
  },
  handler: async (req: Request, h: ResponseToolkit) => {
    const pm = await playerMatches(req.params.nickname);
    assert(
      pm.matches && pm.matches.length,
      Boom.notFound('No Player Matches Found'),
    );
    return pm;
  },
};

const playerCompetitionRoute: ServerRoute = {
  path: '/playerCompetition/{nickname}',
  method: 'GET',
  options: {
    cors: { origin: 'ignore' },
    validate: {
      params: {
        nickname: Joi.string()
          .min(1)
          .max(15)
          .lowercase(),
      },
    },
    response: {
      schema: {
        with: Joi.array(),
        against: Joi.array(),
      },
    },
  },
  handler: (req: Request, h: ResponseToolkit) => {
    return playerCompetition(req.params.nickname);
  },
};

const twitchStreamsRoute: ServerRoute = {
  path: '/twitchStreams',
  method: 'GET',
  options: {
    tags: ['twitch'],
    cors: { origin: 'ignore' },
    cache: {
      expiresIn: 60 * 5 * 1000,
    },
  },
  handler: async (req: Request, h: ResponseToolkit) => {
    const streams = await getTwitchStreams();
    return streams;
  },
};

const matchRoute: ServerRoute = {
  path: '/match/{id}',
  method: 'GET',
  options: {
    cors: { origin: 'ignore' },
    validate: {
      params: {
        id: Joi.number()
          .min(147503112)
          .positive()
          .required(),
      },
    },
    // response: {
    //   schema: Joi.object(),
    // },
  },
  handler: async (req: Request, h: ResponseToolkit) => {
    const conn = await getConnection();
    const match = await conn
      .getRepository(Match)
      .findOne({ id: Number(req.params.id) });
    assert(!!match, Boom.notFound('Match not found'));
    return match;
  },
};

const matchSkillRoute: ServerRoute = {
  path: '/matchSkill/{id}',
  method: 'GET',
  options: {
    cors: { origin: 'ignore' },
    validate: {
      params: {
        id: Joi.number()
          .min(147503112)
          .positive()
          .required(),
      },
    },
    response: {
      schema: {
        quality: Joi.number(),
        averageScore: Joi.number(),
        oddsTeam1Win: Joi.number(),
        trueskill: Joi.array().items(
          Joi.object().keys({
            account_id: Joi.number(),
            mu: Joi.number(),
            sigma: Joi.number(),
            games: Joi.number(),
          }),
        ),
      },
    },
  },
  handler: async (req: Request, h: ResponseToolkit) => {
    const conn = await getConnection();
    const query = { id: Number(req.params.id), setup_nl: 1, setup_officl: 1 };
    const match = await conn.getRepository(Match).findOne(query);
    assert(!!match, Boom.notFound('Match not found'));
    assert(match.players.length > 1, Boom.notFound('Not enough players'));
    return matchSkill(match.players);
  },
};

const playerSkillRoute: ServerRoute = {
  path: '/playerSkill/{id}',
  method: 'GET',
  options: {
    cors: { origin: 'ignore' },
    validate: {
      params: {
        id: Joi.number()
          .positive()
          .required(),
      },
    },
    response: {
      schema: {
        account_id: Joi.number(),
        mu: Joi.number(),
        sigma: Joi.number(),
        games: Joi.number(),
      },
    },
  },
  handler: async (req: Request, h: ResponseToolkit) => {
    const conn = await getConnection();
    const skill = await conn
      .getRepository(Trueskill)
      .findOne(Number(req.params.id));
    assert(skill !== null, Boom.notFound('Skill not found'));
    assert(!!skill, Boom.notFound('Skill not found'));
    return skill;
  },
};

const latestMatchesRoute: ServerRoute = {
  path: '/latestMatches',
  method: 'GET',
  options: {
    cors: { origin: 'ignore' },
    tags: ['latest'],
    // response: {
    //   schema: Joi.array(),
    // },
  },
  handler: async (req: Request, h: ResponseToolkit) => {
    const cache = await getCache('latestMatches');
    if (cache) {
      return JSON.parse(cache);
    }
    const conn = await getConnection();
    const matches = await conn
      .createQueryBuilder()
      .select('match')
      .from(Match, 'match')
      .orderBy('match.id', 'DESC')
      .innerJoinAndSelect('match.players', 'players')
      .take(10)
      .getMany();
    client.setex('latestMatches', 60 * 5 * 1000, JSON.stringify(matches));
    return matches;
  },
};

let statsCache;
const statsRoute: ServerRoute = {
  path: '/stats',
  method: 'GET',
  options: {
    cors: { origin: 'ignore' },
    tags: ['stats'],
  },
  handler: async (req: Request, h: ResponseToolkit) => {
    if (!statsCache) {
      statsCache = server.cache({
        segment: 'stats',
        expiresIn: 60 * 15 * 1000,
      });
    }
    const value = await statsCache.get('stats');
    if (value) {
      return value;
    }
    const s = await stats();
    await statsCache.set('stats', s, 60 * 15 * 1000);
    return s;
  },
};

let herostatsCache;
const herostatsRoute: ServerRoute = {
  path: '/herostats',
  method: 'GET',
  options: {
    cors: { origin: 'ignore' },
  },
  handler: async (req: Request, h: ResponseToolkit) => {
    if (!herostatsCache) {
      herostatsCache = server.cache({
        segment: 'herostats',
        expiresIn: 60 * 60 * 1000,
      });
    }
    const value = await herostatsCache.get('herostats');
    if (value) {
      return value;
    }
    const s = await heroStats();
    await herostatsCache.set('herostats', s, 60 * 60 * 1000);
    return s;
  },
};

export const serverRoutes = [
  playerMatchRoute,
  playerCompetitionRoute,
  twitchStreamsRoute,
  matchRoute,
  matchSkillRoute,
  playerSkillRoute,
  latestMatchesRoute,
  statsRoute,
  herostatsRoute,
];
