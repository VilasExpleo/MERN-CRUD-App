import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadXmlComponent } from './upload-xml/upload-xml.component';
import { ValidateXmlComponent } from './validate-xml/validate-xml.component';

@NgModule({
    declarations: [UploadXmlComponent, ValidateXmlComponent],
    imports: [CommonModule, FormsModule],
    exports: [UploadXmlComponent, ValidateXmlComponent],
})
export class UploadNewXmlModule {}
