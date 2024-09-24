export enum HttpErrorCodesEnum {
    // For detail, please refer https://devstack.vwgroup.com/confluence/display/HMIL/Global+Error+Handling
    'BadRequest' = 400,
    'Unauthorized' = 401,
    'Forbidden' = 403,
    'NotFound' = 404,
    'RequestTimeOut' = 408,
    'TooManyRequest' = 429,
    'InternalServerError' = 500,
    'BadGateway' = 502,
    'TemporarilyUnavailable' = 503,
    'GatewayTimeout' = 504,
}
