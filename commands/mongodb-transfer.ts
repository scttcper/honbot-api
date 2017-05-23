// import * as _ from 'lodash';
// import * as Sequelize from 'sequelize';
// import { Rating, TrueSkill } from 'ts-trueskill';
// import { Db, MongoClient } from 'mongodb';
//
// import { Heropick, Matches, PlayerAttributes, Players, Trueskill, TrueskillAttributes } from '../models';
// import { heroPick } from '../src/heroes';
// import { calculatePlayerSkill } from '../src/skill';
//
// const ts = new TrueSkill(null, null, null, null, 0);
//
// async function loop() {
//   const db = await MongoClient.connect('mongodb://127.0.0.1/hon');
//   const oldest = await db.collection('matches')
//     .findOne({
//       failed: false,
//     }, {
//       sort: { match_id: 1 },
//     });
//   const mid = await Matches.findOne({ order: 'id DESC' });
//   let cur = mid ? mid.get('id') : 0;
//   while (true) {
//     const promises = [];
//     const batch = await db
//       .collection('matches')
//       .find({ match_id: { $gt: cur } })
//       .sort({ match_id: 1 })
//       .limit(100)
//       .toArray();
//     cur = batch[batch.length - 1].match_id;
//     const players = [];
//     const res = [];
//     for (const m of batch) {
//       delete m.c_state;
//       m.id = m.match_id;
//       delete m.match_id;
//       _.keys(m.setup).map((k) => {
//         if (k === 'match_id') {
//           return;
//         }
//         m[`setup_${k}`] = m.setup[k];
//       });
//       delete m.setup;
//       res.push(m);
//       m.players.map((n) => {
//         if (!_.isArray(n.items)) {
//           n.items = n.items.items;
//         }
//         n.matchId = n.match_id;
//         delete n.match_id;
//         players.push(n);
//       });
//       if (m.setup_nl + m.setup_officl === 2) {
//         await calculatePlayerSkill(m.players).catch((err) => {
//           console.error(err);
//           process.exit();
//         });
//         promises.push(heroPick(m.players, m.date));
//       }
//       if (batch.length !== 100) {
//         return;
//       }
//     }
//     await Promise.all([
//       Matches.bulkCreate(res),
//       Players.bulkCreate(players),
//       ...promises,
//     ]).catch((err) => {
//       console.error(err);
//       process.exit();
//     });
//   }
// }
// loop().then(() => process.exit()).catch((e) => console.log(e));
