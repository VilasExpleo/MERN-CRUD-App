import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService, TreeDragDropService } from 'primeng/api';
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
import { ProjectService } from 'src/app/core/services/project/project.service';

import { TabViewModule } from 'primeng/tabview';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProjectComponentsModule } from '../components/project-components.module';
import { ConfirmProjectPropertiesComponent } from './confirm-project-properties/confirm-project-properties.component';
import { DragAndDropComponent } from './drag-and-drop/drag-and-drop.component';
import { LanguageInheritanceTreeComponent } from './language-inheritance/language-inheritance.component';
import { MetadataOfProjectComponent } from './metadata-of-project/metadata-of-project.component';
import { SelectBaseFileComponent } from './select-base-file/select-base-file.component';
import { UsersComponent } from './users/users.component';
@NgModule({
    declarations: [
        SelectBaseFileComponent,
        MetadataOfProjectComponent,
        DragAndDropComponent,
        LanguageInheritanceTreeComponent,
        ConfirmProjectPropertiesComponent,
        UsersComponent,
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
        ProjectComponentsModule,
        SharedModule,
        TabViewModule,
    ],
    exports: [SelectBaseFileComponent, DragAndDropComponent, LanguageInheritanceTreeComponent, UsersComponent],
    providers: [TreeDragDropService, ProjectService, MessageService, ConfirmationService],
})
export class CreateProjectModule {}
