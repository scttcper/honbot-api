import { Matches, Players, Trueskill, Heropick } from './index';

Matches.sync({ force: true })
  .then(() => Players.sync({ force: true }))
  .then(() => Trueskill.sync({ force: true }))
  .then(() => Heropick.sync({ force: true }));
