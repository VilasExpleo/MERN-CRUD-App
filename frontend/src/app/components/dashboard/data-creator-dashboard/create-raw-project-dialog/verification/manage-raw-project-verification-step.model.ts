import {
    FontPackageModel,
    LengthCalculationModel,
    ManageRawProjectStateModel,
} from '../manage-raw-project-state.model';

export interface ManageRawProjectVerificationStepModel {
    model: ManageRawProjectStateModel;
    fontPackages: FontPackageModel[];
    lengthCalculations: LengthCalculationModel[];
}
