import * as debug from 'debug';
import * as kcors from 'kcors';
import * as Koa from 'koa';
import * as logger from 'koa-logger';
import * as koaRaven from 'koa2-raven';
import * as Raven from 'raven';

import config from '../config';
import mainRouter from './routes';

const log = debug('honbot');

const app = new Koa();
module.exports = app;
app.proxy = true;
if (process.env.NODE_ENV !== 'dev') {
  const ravenClient = Raven.config(config.dsn).install({
    captureUnhandledRejections: true,
  });
  koaRaven(app, ravenClient);
}
app.use(logger());
app.use(kcors());
app.use((ctx, next) => {
  ctx.type = 'json';
  return next();
});

app
  .use(mainRouter.routes())
  .use(mainRouter.allowedMethods());

if (!module.parent) {
  app.listen(config.port);
  log(`http://localhost:${config.port}`);
}
