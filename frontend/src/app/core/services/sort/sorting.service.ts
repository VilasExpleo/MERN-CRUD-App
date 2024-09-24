import { Injectable } from '@angular/core';
import { SortOrderEnum } from '../../../shared/enums/sort-order.enum';
import { AbstractControl, ɵTypedOrUntyped } from '@angular/forms';

@Injectable({
    providedIn: 'root',
})
export class SortingService {
    sortByProperty(array: any[], sortByProperty: string, sortOrder: SortOrderEnum = SortOrderEnum.Asc): any[] {
        return array.sort((a, b) => {
            if (sortOrder === SortOrderEnum.Asc) {
                return a[sortByProperty] < b[sortByProperty] ? -1 : a[sortByProperty] > b[sortByProperty] ? 1 : 0;
            }

            return a[sortByProperty] < b[sortByProperty] ? -1 : a[sortByProperty] > b[sortByProperty] ? 0 : 1;
        });
    }

    sortFormControlByProperty(
        controls: ɵTypedOrUntyped<any, Array<any>, Array<AbstractControl<any>>>,
        property: string,
        sortOrder: SortOrderEnum = SortOrderEnum.Asc
    ) {
        return controls.sort((a, b) => {
            if (sortOrder === SortOrderEnum.Asc) {
                return a.value[property] < b.value[property] ? -1 : a.value[property] > b.value[property] ? 1 : 0;
            }

            return a.value[property] < b.value[property] ? -1 : a.value[property] > b.value[property] ? 0 : 1;
        });
    }
}
