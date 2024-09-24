import { Injectable } from '@angular/core';
import { DropDownModel } from 'src/app/shared/models/translation-manager';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    getFilterFromNumericEnum(value: { [key: number]: string }): DropDownModel[] {
        return Object.values(value)
            .filter((value) => isNaN(Number(value)))
            .map((value) => this.getOptionDropdownFormat(value, value));
    }

    getFilterFromStringEnum(value: { [key: number]: string }): DropDownModel[] {
        return Object.entries(value).map(([key, value]) => this.getOptionDropdownFormat(value, key));
    }

    private getOptionDropdownFormat(label: string, value: string) {
        return { label, value };
    }
}
