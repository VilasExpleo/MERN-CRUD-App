// chunk.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'chunk',
})
export class ChunkPipe implements PipeTransform {
    transform(arr: any[], chunkSize: number): any[] {
        if (!Array.isArray(arr)) {
            return arr;
        }
        return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, index) =>
            arr.slice(index * chunkSize, (index + 1) * chunkSize)
        );
    }
}
