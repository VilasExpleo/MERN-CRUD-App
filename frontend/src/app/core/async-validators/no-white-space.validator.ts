import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';

export class NoWhiteSpaceValidator {
    static validate(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const value: string = control.value;
            return /\s/.test(value) ? of({ leadingSpaces: true }) : of(null);
        };
    }
}
