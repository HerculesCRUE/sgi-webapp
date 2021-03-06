// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { NgxLoggerLevel, LoggerConfig } from 'ngx-logger';
import { SgiAuthMode, SgiAuthConfig } from '@sgi/framework/auth';
import { version } from '../../package.json';

export const environment = {
  production: false,
  serviceServers: {
    eti: '/api/eti',
    sgp: '/api/sgp',
    csp: '/api/csp',
    usr: '/api/usr',
    sgdoc: '/api/sgdoc',
    sge: '/api/sge',
    sgemp: '/api/sgemp'
  },
  loggerConfig: {
    enableSourceMaps: true, // <-- THIS IS REQUIRED, to make "line-numbers" work in SourceMap Object defition (without evalSourceMap)
    level: NgxLoggerLevel.DEBUG
  } as LoggerConfig,
  authConfig: {
    mode: SgiAuthMode.Keycloak,
    ssoRealm: 'sgi',
    ssoClientId: 'front',
    ssoUrl: 'http://sgi-auth:8080/auth',
    // InMemory  auth config
    inMemoryConfig: {
      userRefId: '',
      authorities: [],
      isInvestigador: false
    },
    protectedResources: [
      /\/api\/eti.*/i,
      /\/api\/csp.*/i,
      /\/api\/usr.*/i,
      /\/api\/sgp.*/i,
      /\/api\/sgemp.*/i
    ]
  } as SgiAuthConfig,
  version
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
