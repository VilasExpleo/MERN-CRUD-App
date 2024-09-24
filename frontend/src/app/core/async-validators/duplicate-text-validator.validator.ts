import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';

export class DuplicateTextValidator {
    static validate(texts: string[]): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            return texts.find((text) => text.toLocaleLowerCase() === control.value.toLocaleLowerCase())
                ? of({ duplicate: true })
                : of(null);
        };
    }
}
