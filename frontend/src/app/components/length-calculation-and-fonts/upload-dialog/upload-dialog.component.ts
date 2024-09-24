import { Component } from '@angular/core';
import { LengthCalculationService } from 'src/app/core/services/length-calculation-and-fonts/length-calculation.service';
import { FileUploadService } from 'src/app/core/services/files/file-upload.service';

@Component({
    selector: 'app-upload-dialog',
    templateUrl: './upload-dialog.component.html',
    styleUrls: ['./upload-dialog.component.scss'],
})
export class UploadDialogComponent {
    constructor(
        public lengthCalculationService: LengthCalculationService,
        private fileUploadService: FileUploadService
    ) {}

    checkIfFontsFormIsInvalid() {
        return !(this.lengthCalculationService.isFontFileUploaded && this.lengthCalculationService.fontsForm.valid);
    }
    checkDuplicateFontVersion() {
        return (
            this.lengthCalculationService.isDuplicateFontNameExist &&
            this.lengthCalculationService.isDuplicateFontVersionExist
        );
    }

    checkIfFormIsValidAndVersionAlreadyDoesNotexist() {
        return !this.checkIfFontsFormIsInvalid() && !this.checkDuplicateFontVersion();
    }
    getFileSize(size: number) {
        return this.fileUploadService.calculateFileSize(size);
    }
}
