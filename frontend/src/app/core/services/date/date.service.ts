import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DateService {
    getValidDate(date: string): Date {
        if (!date) {
            return undefined;
        }

        if (date.indexOf('1900') > -1) {
            return undefined;
        }

        return new Date(date);
    }

    getNumberOfDays(dueDate: Date) {
        const remainingTime = new Date(dueDate).getTime() - new Date().getTime();
        return Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
    }
}
