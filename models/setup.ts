import { Matches, Players, Trueskill, Heropick, Failed } from './index';

export function setup(force = false): any {
  return Matches.sync({ force })
    .then(() => Players.sync({ force }))
    .then(() => Trueskill.sync({ force }))
    .then(() => Heropick.sync({ force }))
    .then(() => Failed.sync({ force }));
}

if (!module.parent) {
  setup();
}
