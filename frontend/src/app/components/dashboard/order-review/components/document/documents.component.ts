import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';
import { OrderReviewService } from 'src/app/core/services/order-review/order-review.service';
import {
    OrderReviewStateModel,
    initializeOrderReviewState,
} from '../../../../../core/services/order-review/order-review.model';
@Component({
    selector: 'app-order-review-documents',
    templateUrl: './documents.component.html',
})
export class OrderReviewDocumentsComponent implements OnInit {
    model: OrderReviewStateModel = initializeOrderReviewState;
    errorMessages: Message[];
    allowedFileFormats = '.jpg,.png,.xls,.xlsx,.doc,.docx,.csv,.pdf';
    maxFileSize = 5242881;

    @Input()
    uploadText = 'Upload files you want to attach to the review order';

    @Output()
    navigationEvent = new EventEmitter<number>();

    constructor(
        private messageService: MessageService,
        private orderReviewService: OrderReviewService,
        private fileUploadService: FileUploadService
    ) {}

    ngOnInit(): void {
        this.orderReviewService.getOrderReviewState().subscribe((response: OrderReviewStateModel) => {
            this.model = response;
        });
    }

    selectFile(event) {
        if (event.files[0].size > this.maxFileSize && event.currentFiles.length > 0) {
            this.errorMessages = [
                {
                    severity: 'error',
                    summary: event.files[0].name,
                    detail: 'Invalid file size maximum upload size is 5 MB.',
                },
            ];
        } else {
            this.errorMessages = [];
        }

        this.model.selectedFiles = event.currentFiles;
    }

    getFileSize(size: number) {
        return this.fileUploadService.calculateFileSize(size);
    }

    removeFile(event: Event, file: File, uploader: FileUpload) {
        const index = uploader.files.indexOf(file);
        uploader.remove(event, index);
        this.model.selectedFiles.splice(index, 1);
        this.messageService.add({
            severity: 'warn',
            summary: `Selected file ${file.name} removed`,
        });
    }

    navigate(index: number) {
        this.orderReviewService.setOrderReviewState(this.model);
        this.navigationEvent.next(index);
    }
}
