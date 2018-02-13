import { subDays, subMinutes } from 'date-fns';
import { Op } from 'sequelize';

import { Matches, sequelize } from '../models';

export default async function stats() {
  const matches = await Matches.count();
  const lastDayDate = subMinutes(subDays(new Date(), 1), 180);
  const loadedLastDay = await Matches.count({ where: { createdAt: { [Op.gt]: lastDayDate } } });
  return { matches, loadedLastDay };
}
