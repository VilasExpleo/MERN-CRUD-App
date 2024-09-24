import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LengthCalculationAndFontsComponent } from './length-calculation-and-fonts.component';
import { FontsComponent } from './fonts/fonts.component';
import { TestBedComponent } from './test-bed/test-bed.component';
import { LengthcalculationAndFontsRoutingModule } from './lengthcalculation-and-fonts-routing.module';
import { LengthCalculationsComponent } from './length-calculations/length-calculations.component';
import { ButtonModule } from 'primeng/button';
import { UploadDialogComponent } from './upload-dialog/upload-dialog.component';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TabViewModule } from 'primeng/tabview';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [
        LengthCalculationAndFontsComponent,
        FontsComponent,
        TestBedComponent,
        LengthCalculationsComponent,
        UploadDialogComponent,
    ],
    imports: [
        CommonModule,
        LengthcalculationAndFontsRoutingModule,
        ButtonModule,
        FileUploadModule,
        ProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        InputTextareaModule,
        TableModule,
        ToastModule,
        ConfirmDialogModule,
        TabViewModule,
        SharedModule,
    ],
})
export class LengthCalculationAndFontsModule {}
