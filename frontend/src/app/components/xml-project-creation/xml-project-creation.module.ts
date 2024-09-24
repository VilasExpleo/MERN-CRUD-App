import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { XmlProjectComponent } from './xml-project/xml-project.component';
@NgModule({
    declarations: [XmlProjectComponent],
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        InputTextModule,
        ButtonModule,
        HttpClientModule,
        ReactiveFormsModule,
        MessageModule,
        ProgressSpinnerModule,
        DropdownModule,
    ],
    exports: [XmlProjectComponent],
    providers: [HttpClient],
})
export class XmlProjectCreationModule {}
