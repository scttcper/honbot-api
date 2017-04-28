import { Match, PlayerMatches } from './index';

Match.sync({ force: true })
  .then(() => PlayerMatches.sync());
