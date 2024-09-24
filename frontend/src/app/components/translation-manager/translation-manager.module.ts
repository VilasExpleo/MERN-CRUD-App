import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AssignWorkerComponent } from './assign-worker/assign-worker.component';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [AssignWorkerComponent],
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
    exports: [AssignWorkerComponent],
})
export class TranslationManagerModule {}
