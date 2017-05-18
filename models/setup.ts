import { Matches, Players, Trueskill, Heropick } from './index';

Matches.sync()
  .then(() => Players.sync())
  .then(() => Trueskill.sync())
  .then(() => Heropick.sync());
