import { UserResponseModel } from '../project/user-response.model';

export interface UserModel extends UserResponseModel {
    brand_id: number;
    brand_name: string;
    role: number;
    token: string;
}
