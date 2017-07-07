import * as debug from 'debug';
import { formatDistance, addMilliseconds } from 'date-fns';

const log = debug('honbot');

export default function sleep(duration: number, reason: string = 'waiting') {
  return new Promise((resolve, reject) => {
    const time = formatDistance(addMilliseconds(new Date(), duration), new Date());
    log(`Sleeping for ${time} because ${reason}`);
    setTimeout(() => { resolve(0); }, duration);
  });
}
