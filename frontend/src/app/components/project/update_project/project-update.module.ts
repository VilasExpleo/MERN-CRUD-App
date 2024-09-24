import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdateXmlComponent } from './update-xml/update-xml.component';
import { SummaryStartExecutionComponent } from './summary-start-execution/summary-start-execution.component';
import { ConfigurationUpdateComponent } from './configuration-update/configuration-update.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PanelModule } from 'primeng/panel';
import { CalendarModule } from 'primeng/calendar';
import { RippleModule } from 'primeng/ripple';
import { MessagesModule } from 'primeng/messages';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

@NgModule({
    declarations: [UpdateXmlComponent, SummaryStartExecutionComponent, ConfigurationUpdateComponent],
    imports: [
        CommonModule,
        FileUploadModule,
        DialogModule,
        ButtonModule,
        StepsModule,
        CardModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        MessageModule,
        ToastModule,
        TableModule,
        DividerModule,
        ProgressSpinnerModule,
        ConfirmDialogModule,
        PanelModule,
        CalendarModule,
        RippleModule,
        MessagesModule,
        CheckboxModule,
        InputTextModule,
        InputNumberModule,
    ],
})
export class ProjectUpdateModule {}
