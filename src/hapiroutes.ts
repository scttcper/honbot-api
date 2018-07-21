import {
  Request,
  ResponseToolkit,
  Server,
  ServerOptions,
  ServerRoute,
  Plugin,
} from 'hapi';
import * as Joi from 'joi';
import { assert } from 'hoek';
import * as Boom from 'boom';
import { server } from './index';

import { Players, Matches, Trueskill } from '../models';
import { PlayerAttributes } from '../models/interfaces';
import { heroStats } from './heroes';
import { matchSkill } from './skill';
import getTwitchStreams from './twitch';
import { playerMatches, playerCompetition } from './playerMatches';
import stats from './stats';

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

let twitchStreamsCache;
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
    if (!twitchStreamsCache) {
      twitchStreamsCache = server.cache({ segment: 'twitchStreams', expiresIn: 60 * 5 * 1000 });
    }
    const value = await twitchStreamsCache.get('twitchStreams');
    if (value) {
      return value;
    }
    const streams = await getTwitchStreams();
    await twitchStreamsCache.set('latestMatches', streams, 60 * 5 * 1000);
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
    const match = await Matches.findById(req.params.id, {
      include: [{ model: Players }],
    });
    assert(match !== null, Boom.notFound('Match not found'));
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
    const query = { id: req.params.id, setup_nl: 1, setup_officl: 1 };
    const match = await Matches.findOne({
      where: query,
      include: [{ model: Players }],
    });
    assert(match !== null, Boom.notFound('Match not found'));
    const players: PlayerAttributes[] = match.get('players');
    assert(players.length > 1, Boom.notFound('Not enough players'));
    // return matchSkill(players);
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
    const skill = await Trueskill.findById(req.params.id, { raw: true });
    assert(skill !== null, Boom.notFound('Skill not found'));
    return skill;
  },
};

let latestMatchesCache;
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
    if (!latestMatchesCache) {
      latestMatchesCache = server.cache({ segment: 'latestMatches', expiresIn: 60 * 5 * 1000 });
    }
    const value = await latestMatchesCache.get('latestMatches');
    if (value) {
      return value;
    }
    const matches = await Matches.findAll({
      include: [{ model: Players }],
      order: [['id', 'DESC']],
      limit: 10,
    });
    await latestMatchesCache.set('latestMatches', matches, 60 * 5 * 1000);
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
      statsCache = server.cache({ segment: 'stats', expiresIn: 60 * 15 * 1000 });
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
      herostatsCache = server.cache({ segment: 'herostats', expiresIn: 60 * 60 * 1000 });
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
