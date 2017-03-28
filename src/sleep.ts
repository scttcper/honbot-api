import * as debug from 'debug';
import * as moment from 'moment-timezone';

const log = debug('honbot');

export default function sleep(duration: number, reason: string = 'waiting') {
  return new Promise((resolve, reject) => {
    const time = moment.duration(duration, 'milliseconds').humanize();
    log(`Sleeping for ${time} because ${reason}`);
    setTimeout(() => { resolve(0); }, duration);
  });
}
