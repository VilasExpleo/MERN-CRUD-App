import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { VirtualScrollerModule } from 'primeng/virtualscroller';

import { SharedModule } from '../../../shared/shared.module';
import { EditablePropertiesComponent } from './properties/editable-properties.component';
import { DocumentsComponent } from './resources/documents/documents.component';
import { ParserConfigComponent } from './resources/parser-config/parser-config.component';
import { ResourcesComponent } from './resources/resources.component';
import { ScreenshotsComponent } from './resources/screenshots/screenshots.component';
import { LcAndFontsComponent } from './resources/lc-and-fonts/lc-and-fonts.component';
import { PanelModule } from 'primeng/panel';
import { ParserConfigItemComponent } from './resources/parser-config/parser-config-item/parser-config-item.component';

// TODO: moved all dependencies to shared folder and use shared here
@NgModule({
    declarations: [
        EditablePropertiesComponent,
        ResourcesComponent,
        ScreenshotsComponent,
        ParserConfigComponent,
        DocumentsComponent,
        LcAndFontsComponent,
        ParserConfigItemComponent,
    ],
    imports: [
        CommonModule,
        DialogModule,
        ButtonModule,
        StepsModule,
        CardModule,
        ReactiveFormsModule,
        HttpClientModule,
        FormsModule,
        MessageModule,
        ToastModule,
        FileUploadModule,
        ProgressSpinnerModule,
        ConfirmDialogModule,
        MessagesModule,
        CalendarModule,
        RippleModule,
        VirtualScrollerModule,
        TreeModule,
        DropdownModule,
        InputTextareaModule,
        RadioButtonModule,
        InputTextModule,
        SharedModule,
        PanelModule,
    ],
    exports: [
        EditablePropertiesComponent,
        ResourcesComponent,
        ScreenshotsComponent,
        ParserConfigComponent,
        DocumentsComponent,
    ],
})
export class ProjectComponentsModule {}
