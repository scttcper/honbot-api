import * as debug from 'debug';
import { distanceInWordsToNow, addMilliseconds } from 'date-fns';

const log = debug('honbot');

export default function sleep(duration: number, reason: string = 'waiting') {
  return new Promise((resolve, reject) => {
    const time = distanceInWordsToNow(addMilliseconds(new Date(), duration));
    log(`Sleeping for ${time} because ${reason}`);
    setTimeout(() => { resolve(0); }, duration);
  });
}
