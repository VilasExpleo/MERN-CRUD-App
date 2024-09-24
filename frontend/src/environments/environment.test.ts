// `ng build --configuration=test` replaces `environment.ts` with `environment.test.ts`.
// This file is for test environment
export const environment = {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    appVersion: require('../../package.json').version,
    production: true,
    apiUrl: 'https://hmiltest.hmilin-dev.dev.eu.bp.aws.cloud.vwgroup.com:3000/',
    webSocket: 'https://hmiltest.hmilin-dev.dev.eu.bp.aws.cloud.vwgroup.com:3100',
    lcUrl: 'https://hmiltest.hmilin-dev.dev.eu.bp.aws.cloud.vwgroup.com:5500/',
    lcWsUrl: 'wss://hmiltest.hmilin-dev.dev.eu.bp.aws.cloud.vwgroup.com:8999',
    reportXSDFileName: 'repoirting_data/SampleXsd.zip',
    fontUploadPath: 'C:/Projects/uploads/fonts/extracted/',
};
