import { UserResponseModel } from './user-response.model';

export interface BrandModel {
    brand: string;
}

export interface UserSettingsModel {
    selectedManager: UserResponseModel;
    readOnlyUsers: number[];
}
