import { ResponseError } from './response-error';

// eslint-disable-next-line @typescript-eslint/ban-types
export interface Response<T = {}> {
    success: boolean;
    response: T;
    errors: ResponseError[];
}
