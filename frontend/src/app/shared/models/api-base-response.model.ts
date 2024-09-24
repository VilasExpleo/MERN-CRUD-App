import { ResponseStatusEnum } from 'src/Enumerations';
export interface ApiBaseResponseModel {
    status?: ResponseStatusEnum;
    message?: string;
    data?: any;
}
