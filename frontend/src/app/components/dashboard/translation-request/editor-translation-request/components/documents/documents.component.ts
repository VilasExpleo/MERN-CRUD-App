import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { Subscription } from 'rxjs';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';

@Component({
    selector: 'app-documents',
    templateUrl: './documents.component.html',
    styleUrls: ['./documents.component.scss'],
})
export class DocumentsComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    selectedFiles = [];
    @ViewChild('fileUpload') fileUpload: FileUpload;

    @Output()
    navigationEvent = new EventEmitter<number>();

    constructor(
        private router: Router,
        public translationRequestService: TranslationRequestService,
        private messageService: MessageService,
        private fileUploadService: FileUploadService
    ) {}

    ngOnInit(): void {
        this.subscription = this.translationRequestService.getDocumentsState().subscribe((res) => {
            if (res !== null) {
                this.selectedFiles = res.selectedFiles;
            }
        });
    }

    selectFile(event: any) {
        this.selectedFiles = event.currentFiles;
    }

    navigate(index: number) {
        this.translationRequestService.setDocumentsState({
            selectedFiles: this.selectedFiles,
        });
        this.navigationEvent.emit(index);
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getFileSize(size: number) {
        return this.fileUploadService.calculateFileSize(size);
    }

    removeFile(event: Event, file: File, uploader: FileUpload) {
        const index = uploader.files.indexOf(file);
        uploader.remove(event, index);
        this.selectedFiles.splice(index, 1);
        this.messageService.add({
            severity: 'warn',
            summary: `Selected file ${file.name} removed`,
        });
    }
}
