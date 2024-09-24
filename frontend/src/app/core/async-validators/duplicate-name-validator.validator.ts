import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';

export class DuplicateNameValidator {
    static validate(service: any, method: string, options?: string): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            return service[method]({ name: control.value, format: control.parent.get(options).value.format }).pipe(
                catchError(() => of(null)),
                map((result: ApiBaseResponseModel) => {
                    return result.status === ResponseStatusEnum.NOK ? { duplicateName: true } : null;
                })
            );
        };
    }
}
