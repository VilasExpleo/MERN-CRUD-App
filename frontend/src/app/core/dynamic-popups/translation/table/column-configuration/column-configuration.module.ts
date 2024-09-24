import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { PickListModule } from 'primeng/picklist';
import { ColumnConfigPopupComponent } from './column-config/column-config-popup.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@NgModule({
    declarations: [ColumnConfigPopupComponent],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PickListModule,
        DropdownModule,
        MultiSelectModule,
        CheckboxModule,
        ButtonModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
    ],
})
export class ColumnConfigPopupModule {}
