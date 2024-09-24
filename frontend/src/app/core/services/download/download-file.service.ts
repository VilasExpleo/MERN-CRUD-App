import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class DownloadFileService {
    downloadFile(file, fileName): void {
        const url = window.URL.createObjectURL(file);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        window.URL.revokeObjectURL(url);
    }
}
