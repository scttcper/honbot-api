import debug from 'debug';
import { formatDistance, addMilliseconds } from 'date-fns';

const log = debug('honbot');

export default async function sleep(
  duration: number,
  reason: string = 'waiting',
) {
  return new Promise(resolve => {
    const time = formatDistance(
      addMilliseconds(new Date(), duration),
      new Date(),
    );
    log(`Sleeping for ${time} because ${reason}`);
    setTimeout(() => {
      resolve(0);
    }, duration);
  });
}
