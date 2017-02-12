import * as redis from 'redis';
import * as request from 'request-promise-native';

import config from '../config';

const client = redis.createClient();

const options = {
  url: 'https://api.twitch.tv/kraken/streams',
  headers: { 'Client-ID': config.twitch },
  qs: { game: 'Heroes of Newerth' },
  json: true,
};

function getCache(): Promise<string> {
  return new Promise((resolve, reject) => {
    client.get('twitch:cache', (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}

export default async function getTwitchStreams() {
  const cache = await getCache();
  if (cache) {
    return JSON.parse(cache);
  }
  let res;
  try {
    res = await request(options);
  } catch (e) {
    return [];
  }
  const sliced = res.streams.slice(0, 4);
  client.setex('twitch:cache', 1200, JSON.stringify(sliced));
  return sliced;
}
