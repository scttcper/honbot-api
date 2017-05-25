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
app.proxy = true;
const sentry = Raven
  .config(config.dsn, { autoBreadcrumbs: true })
  .install({ captureUnhandledRejections: true });
koaRaven(app, sentry);
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

export default app;
