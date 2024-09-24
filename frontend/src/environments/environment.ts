// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    appVersion: require('../../package.json').version,
    production: false,
    apiUrl: 'http://localhost:3000/',
    webSocket: 'http://localhost:3100',
    lcUrl: 'http://localhost:5500/',
    lcWsUrl: 'ws://localhost:8999',
    fontUploadPath: 'C:/uploadTestFiles/uploads/fonts/extracted/',
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
