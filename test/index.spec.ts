import { expect } from 'chai';
import * as _ from 'lodash';

import { setup } from '../models/setup';
import { Matches, Players } from '../models';
import { multimatch } from './data/multimatch';
import { parseMultimatch } from '../src/matches';

describe('dbinit', function() {
  it('should setup database', async function() {
    await setup(true);
  });
});

describe('multimatch', function() {
  it('should load multimatch', async function() {
    const matchIds = multimatch[0].map(n => n.match_id);
    const [parsed, failed] = await parseMultimatch(multimatch, matchIds);
    await Matches.bulkCreate(parsed);
    await Players.bulkCreate(_.flatten(parsed.map(n => n.players)));
  });
});
