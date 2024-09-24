import { ManageRawProjectStateModel, ProjectType } from '../manage-raw-project-state.model';

export interface ManageRawProjectDetailsStepModel {
    model: ManageRawProjectStateModel;
    projectTypes: ProjectType[];
}
