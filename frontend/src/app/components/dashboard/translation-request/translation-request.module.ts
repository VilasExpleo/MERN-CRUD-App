import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from 'src/app/shared/shared.module';
import { ManageDocumentsComponent } from './components/manage-documents/manage-documents.component';
import { ReferenceLanguagesComponent } from './components/reference-languages/reference-languages.component';
import { StatisticalEvaluationComponent } from './components/statistical-evaluation/statistical-evaluation.component';
import { ViewDocumentsComponent } from './components/view-documents/view-documents.component';
import { EditorTranslationRequestModule } from './editor-translation-request/editor-translation-request.module';
import { AssignProjectManagerComponent } from './translation-request-view/assign-project-manager/assign-project-manager.component';
import { LanguageGridComponent } from './translation-request-view/translation-import/dialog/grid/language-grid.component';
import { ImportLanguagesComponent } from './translation-request-view/translation-import/dialog/import-languages.component';
import { TranslationRequestViewComponent } from './translation-request-view/translation-request-view.component';

@NgModule({
    declarations: [
        ManageDocumentsComponent,
        ViewDocumentsComponent,
        StatisticalEvaluationComponent,
        TranslationRequestViewComponent,
        ImportLanguagesComponent,
        LanguageGridComponent,
        AssignProjectManagerComponent,
        ReferenceLanguagesComponent,
    ],
    imports: [
        CommonModule,
        EditorTranslationRequestModule,
        FileUploadModule,
        ButtonModule,
        SharedModule,
        ConfirmDialogModule,
        ToastModule,
        TableModule,
        DialogModule,
        ChartModule,
        ContextMenuModule,
        ReactiveFormsModule,
        FormsModule,
        DropdownModule,
        CheckboxModule,
        OverlayPanelModule,
    ],
    exports: [
        TranslationRequestViewComponent,
        EditorTranslationRequestModule,
        ManageDocumentsComponent,
        ViewDocumentsComponent,
        StatisticalEvaluationComponent,
        ImportLanguagesComponent,
        LanguageGridComponent,
    ],
})
export class TranslationRequestModule {}
