import { Component, OnInit } from '@angular/core';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
})
export class DocumentsComponent implements OnInit {
    isMiscellaneousDocumentsFileSelected = false;
    miscellaneousDocumentsFile: File;
    constructor(private readonly fileUploadService: FileUploadService) {}

    ngOnInit(): void {
        console.warn('code here');
    }

    onMiscellaneousDocumentsSelected(event: any) {
        this.miscellaneousDocumentsFile = event.files[0];
    }

    getFileSize(size: number) {
        return this.fileUploadService.calculateFileSize(size);
    }
}
