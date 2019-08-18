import request from 'request-promise-native';

import config from '../config';
import { client, getCache } from './redis';

const options = {
  url: 'https://api.twitch.tv/helix/streams',
  headers: {
    'Client-ID': config.twitch,
  },
  qs: { game: 'Heroes of Newerth' },
  json: true,
};

export default async function getTwitchStreams() {
  const cache = await getCache('twitch:cache');
  if (cache) {
    return JSON.parse(cache);
  }

  let res;
  try {
    res = await request(options);
  } catch {
    return [];
  }

  const sliced = res.streams.slice(0, 4);
  client.setex('twitch:cache', 1000, JSON.stringify(sliced));
  return sliced;
}
