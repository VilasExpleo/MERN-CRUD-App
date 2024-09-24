import { Pipe, PipeTransform } from '@angular/core';
import { UtcToLocalTimeFormat } from 'src/app/shared/models/dashboard-scheduler';

@Pipe({
    name: 'utcToLocalTime',
})
export class UtcToLocalTimePipe implements PipeTransform {
    transform(
        utcDate: string, // UTC ISO-8601
        format: UtcToLocalTimeFormat = UtcToLocalTimeFormat.SHORT
    ): string {
        const browserLanguage = navigator.language;
        if (format === UtcToLocalTimeFormat.SHORT) {
            const date = new Date(utcDate).toLocaleDateString(browserLanguage);
            const time = new Date(utcDate).toLocaleString(browserLanguage, { timeStyle: 'short' });
            return `${date}, ${time}`;
        } else {
            return new Date(utcDate).toString();
        }
    }
}
