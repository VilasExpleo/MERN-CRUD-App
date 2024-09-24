// `ng build --configuration=uat` replaces `environment.ts` with `environment.uat.ts`.
// This file is for uat environment
export const environment = {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    appVersion: require('../../package.json').version,
    production: true,
    apiUrl: 'https://hmil.hmilin-dev.dev.eu.bp.aws.cloud.vwgroup.com/bacendapi/',
    webSocket: 'https://lchmil.hmilin-dev.dev.eu.bp.aws.cloud.vwgroup.com',
    lcUrl: 'https://lchmil.hmilin-dev.dev.eu.bp.aws.cloud.vwgroup.com/lcapi/',
    lcWsUrl: 'wss://lchmil.hmilin-dev.dev.eu.bp.aws.cloud.vwgroup.com/lcwebsoc/',
    reportXSDFileName: 'reporting_data/SampleXsd.zip',
    fontUploadPath: 'C:/Projects_UAT/uploads/fonts/extracted/',
};
