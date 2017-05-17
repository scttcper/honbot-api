import { Matches, Players } from './index';

Matches.sync({ force: true })
  .then(() => Players.sync({ force: true }));
