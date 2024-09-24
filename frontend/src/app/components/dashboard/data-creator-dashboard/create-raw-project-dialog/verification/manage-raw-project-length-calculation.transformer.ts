import { Injectable } from '@angular/core';
import { LengthCalculationModel } from '../manage-raw-project-state.model';

@Injectable({
    providedIn: 'root',
})
export class ManageRawProjectLengthCalculationTransformer {
    transform(lengthCalculations): LengthCalculationModel[] {
        return lengthCalculations.map((lc) => ({
            id: lc.id,
            name: lc.lc_name,
            isDefault: false,
            isSelected: false,
        }));
    }
}
