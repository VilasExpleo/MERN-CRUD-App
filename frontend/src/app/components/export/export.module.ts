import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExportRoutingModule } from './export-routing.module';
import { ExportComponent } from './export.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { ExcutionComponent } from './excution/excution.component';
import { UploadXsltFileComponent } from './upload-xslt-file/upload-xslt-file.component';
import { FieldsetModule } from 'primeng/fieldset';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
@NgModule({
    declarations: [ExportComponent, ExcutionComponent, UploadXsltFileComponent],
    imports: [
        CommonModule,
        ExportRoutingModule,
        DialogModule,
        ButtonModule,
        TabViewModule,
        FieldsetModule,
        DropdownModule,
        InputTextModule,
        FileUploadModule,
        FormsModule,
        ProgressSpinnerModule,
        InputTextareaModule,
        MessagesModule,
        MessageModule,
        ToastModule,
        AccordionModule,
        ConfirmDialogModule,
        CheckboxModule,
    ],
    exports: [ExportComponent],
})
export class ExportModule {}
