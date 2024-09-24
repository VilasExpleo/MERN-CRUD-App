import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'split',
})
export class SplitPipe implements PipeTransform {
    transform(text: number, by: string, index = 1) {
        const arr = text.toString().split(by); // split text by "by" parameter
        return arr[index]; // after splitting to array return wanted index
    }
}
