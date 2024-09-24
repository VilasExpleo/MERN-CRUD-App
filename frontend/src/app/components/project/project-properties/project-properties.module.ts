import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService, TreeDragDropService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProjectComponentsModule } from '../components/project-components.module';
import { BaseFileComponent } from './base-file/base-file.component';
import { FontMappingComponent } from './font-mapping/font-mapping.component';
import { LanguageInheritanceComponent } from './language-inheritance/language-inheritance.component';
import { LanguageSettingsComponent } from './language-settings/language-settings.component';
import { MetadataComponent } from './metadata/metadata.component';
import { ProjectPropertiesComponent } from './project-properties.component';
import { TranslationChecksComponent } from './translation-checks/translation-checks.component';
import { UsersComponent } from './users/users.component';
import { ConfirmCreateRawProjectComponent } from './confirm-create-raw-project/confirm-create-raw-project.component';
import { RouterModule } from '@angular/router';
@NgModule({
    declarations: [
        ProjectPropertiesComponent,
        BaseFileComponent,
        LanguageSettingsComponent,
        LanguageInheritanceComponent,
        FontMappingComponent,
        MetadataComponent,
        UsersComponent,
        TranslationChecksComponent,
        ConfirmCreateRawProjectComponent,
    ],
    imports: [
        FormsModule,
        CommonModule,
        TabViewModule,
        ButtonModule,
        InputTextModule,
        ReactiveFormsModule,
        DropdownModule,
        RadioButtonModule,
        CalendarModule,
        InputTextareaModule,
        ToastModule,
        TreeModule,
        TableModule,
        FileUploadModule,
        ConfirmDialogModule,
        ProjectComponentsModule,
        SharedModule,
        RouterModule,
    ],
    providers: [TreeDragDropService, MessageService],
})
export class ProjectPropertiesModule {}
