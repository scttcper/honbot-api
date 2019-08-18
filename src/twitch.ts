import request from 'request-promise-native';

import config from '../config';
import { client, getCache } from './redis';

const options = {
  url: 'https://api.twitch.tv/helix/streams',
  headers: {
    'Client-ID': config.twitch,
  },
  qs: {
    game_id: 24664,
    first: 4,
  },
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

  client.setex('twitch:cache', 1000, JSON.stringify(res.data));
  return res.data;
}
