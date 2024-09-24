import { LanguageModel, ManageRawProjectStateModel } from '../manage-raw-project-state.model';

export interface ManageRawProjectLanguageStepModel {
    model: ManageRawProjectStateModel;
    languages: LanguageModel[];
}
