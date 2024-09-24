import { ValidatorFn, AbstractControl } from '@angular/forms';

export function noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        const value: string = control.value;
        if (value?.trimStart() !== value) {
            return { leadingSpaces: true };
        }
        return null;
    };
}
