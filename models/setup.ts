import { Matches, Players, Trueskill, Heropick } from './index';

const force = true;

Matches.sync({ force })
  .then(() => Players.sync({ force }))
  .then(() => Trueskill.sync({ force }))
  .then(() => Heropick.sync({ force }));
