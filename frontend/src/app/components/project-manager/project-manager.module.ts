import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssignTranslationManagerComponent } from './assign-translation-manager/assign-translation-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [AssignTranslationManagerComponent],
    imports: [
        CommonModule,
        DialogModule,
        ProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
        DropdownModule,
        CalendarModule,
        TableModule,
        CheckboxModule,
        InputTextModule,
        ConfirmDialogModule,
        MessageModule,
        SharedModule,
    ],
    exports: [AssignTranslationManagerComponent],
})
export class ProjectManagerModule {}
