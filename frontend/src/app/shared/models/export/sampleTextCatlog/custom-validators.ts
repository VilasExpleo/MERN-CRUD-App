import { UntypedFormControl } from '@angular/forms';
export class CustomValidators {
    stcTextValidator(control: UntypedFormControl): { [key: string]: boolean } {
        const nameRegexp = /^([a-zA-Z0-9]+\s)*[a-zA-Z0-9]+$/;
        if (control.value && nameRegexp.test(control.value)) {
            return { invalidText: true };
        } else {
            return { invalidText: false };
        }
    }
}
