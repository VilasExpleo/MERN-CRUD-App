import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from 'src/app/shared/shared.module';
import { DocumentsComponent } from './components/documents/documents.component';
import { FilterTranslationComponent } from './components/filter-translation/filter-translation.component';
import { JobDetailsComponent } from './components/job-details/job-details.component';
import { LanguageSelectionComponent } from './components/language-selection/language-selection.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { TasksComponent } from './components/tasks/tasks.component';
import { TranslationConfirmationComponent } from './components/translation-confirmation/translation-confirmation.component';
import { TranslationRequestComponent } from './translation-request.component';
import { ReferenceLanguagesComponent } from './components/reference-language/reference-language.component';

@NgModule({
    declarations: [
        LanguageSelectionComponent,
        JobDetailsComponent,
        TranslationConfirmationComponent,
        DocumentsComponent,
        FilterTranslationComponent,
        StatisticsComponent,
        TranslationRequestComponent,
        ReferenceLanguagesComponent,
        TasksComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        ConfirmDialogModule,
        PickListModule,
        DropdownModule,
        CalendarModule,
        SelectButtonModule,
        FileUploadModule,
        HttpClientModule,
        ChartModule,
        StepsModule,
        TableModule,
        MultiSelectModule,
        SliderModule,
        FormsModule,
        ProgressSpinnerModule,
        SharedModule,
        ToastModule,
        CheckboxModule,
        CardModule,
        InputTextModule,
        FieldsetModule,
        TooltipModule,
    ],
    exports: [
        LanguageSelectionComponent,
        JobDetailsComponent,
        TranslationConfirmationComponent,
        DocumentsComponent,
        FilterTranslationComponent,
        StatisticsComponent,
    ],
})
export class EditorTranslationRequestModule {}
