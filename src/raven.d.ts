declare var Raven: RavenStatic;

declare module 'raven' {
  export default Raven;
}

interface RavenStatic {
  config(dsn: string | boolean, options?: any): RavenStatic;
  install(options?: any): RavenStatic;
}
