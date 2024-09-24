import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RawProjectService } from '../services/data-creator/raw-project.service';
import { RawProjectCheckUniquePropertiesValidatorModel } from './raw-project-check-unique-properties-validator.model';
import { UseCaseEnum } from '../../shared/enums/use-case.enum';

export class RawProjectXmlIdValidator {
    static createValidator(
        rawProjectService: RawProjectService,
        model: RawProjectCheckUniquePropertiesValidatorModel
    ): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            if (model.projectXmlId?.length) {
                return of(null);
            }
            if (model.useCase === UseCaseEnum.Edit && control.value === model.projectXmlId) {
                return of(null);
            }

            const validatorModel: RawProjectCheckUniquePropertiesValidatorModel = {
                projectId: model.projectId,
                projectXmlId: control.value,
                useCase: model.useCase,
            };

            return rawProjectService.checkUniqueProperties(validatorModel).pipe(
                map((results) => {
                    const result = results.find((el) => el.property === 'projectXmlId');
                    return result?.isInUse ? { projectIdAlreadyExists: true } : null;
                })
            );
        };
    }
}
