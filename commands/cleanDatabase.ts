import { Matches, Failed, Heropick, Players } from '../models';
import { subDays, subMonths } from 'date-fns';
import { Op } from 'sequelize';

async function loop() {
  const old = subDays(new Date(), 120);
  const query1 = {
    where: {
      createdAt: { [Op.lte]: old },
      mode: { [Op.in]: ['Devo Wars', 'Rift Wars', 'Mid Wars', 'Capture the Flag', 'Unknown'] },
    },
  };
  const unrankedDeleted = await Matches.count(query1);
  console.log('unranked', unrankedDeleted);
  if (unrankedDeleted > 0) {
    await Matches.destroy(query1);
  }

  const query4 = {
    where: {
      matchId: { [Op.eq]: null },
    },
  };
  const playersDeleted = await Players.count(query4);
  console.log('playersDeleted', playersDeleted);
  if (playersDeleted > 0) {
    await Players.destroy(query4);
  }

  const month = subMonths(new Date(), 3);
  const query2 = {
    where: {
      createdAt: { [Op.lte]: old },
    },
  };
  const failedDeleted = await Failed.count(query2);
  console.log('failedDeleted', failedDeleted);
  if (failedDeleted > 0) {
    await Failed.destroy(query2);
  }
  const query3 = {
    where: {
      date: { [Op.lte]: old },
    },
  };
  const pickDeleted = await Heropick.count(query3);
  console.log('Heropick', pickDeleted);
  if (failedDeleted > 0) {
    await Heropick.destroy(query3);
  }
}

loop()
  .then(() => process.exit())
  .catch(e => console.error(e));
