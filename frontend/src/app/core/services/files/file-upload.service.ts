import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class FileUploadService {
    calculateFileSize(size: number): string {
        size = size ?? 0;
        const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
        return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB', 'PB'][i];
    }
}
