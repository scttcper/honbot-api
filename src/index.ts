import { Server, ServerOptions } from '@hapi/hapi';
import * as Sentry from '@sentry/node';

import config from '../config';
import { serverRoutes } from './routes';

Sentry.init({ dsn: config.dsn });

const options: ServerOptions = {
  host: 'localhost',
  port: config.port,
};

const ravenPlugin: any = {
  plugin: require('hapi-sentry'),
  options: { client: { dsn: config.dsn, client: Sentry } },
};

const goodPlugin: any = {
  plugin: require('good'),
  options: {
    ops: {
      interval: 1000,
    },
    reporters: {
      // TODO: silence console reporter for tests
      myConsoleReporter: [
        {
          module: 'good-squeeze',
          name: 'Squeeze',
          args: [{ log: '*', response: '*' }],
        },
        {
          module: 'good-console',
        },
        'stdout',
      ],
    },
  },
};

export const server = new Server(options);

export const register = server.register([ravenPlugin, goodPlugin]);
server.route(serverRoutes);

if (!module.parent) {
  register
    // eslint-disable-next-line @typescript-eslint/require-await
    .then(async () => server.start())
    .then()
    .then(_ => {
      console.log('Server running at:', server.info.uri);
      return server;
    })
    .catch(err => console.log(err));
}
