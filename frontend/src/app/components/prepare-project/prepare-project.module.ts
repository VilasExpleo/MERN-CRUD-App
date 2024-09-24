import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrepareProjectComponent } from './prepare-project/prepare-project.component';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputRestrictionDirective } from './prepare-pipe';

@NgModule({
    declarations: [PrepareProjectComponent, InputRestrictionDirective],
    imports: [
        CommonModule,
        DialogModule,
        ProgressSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        InputTextModule,
        ButtonModule,
    ],
    exports: [PrepareProjectComponent],
})
export class PrepareProjectModule {}
