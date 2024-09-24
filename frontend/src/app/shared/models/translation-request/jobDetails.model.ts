import { Manager } from './manager';

export interface JobDetails {
    selectedManager: Manager;
    description: string;
    proofRead: boolean;
    isConstrained: boolean;
}
