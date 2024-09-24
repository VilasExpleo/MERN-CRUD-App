import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { PickListModule } from 'primeng/picklist';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ProjectReportModule } from '../Reports/project-report/project-report.module';
import { SpellcheckComponent } from './about-hmil/spellcheck/spellcheck.component';
import { MappingComponent } from './mapping/mapping.component';
import { SettingsComponent } from './settings.component';
import { SpellCheckModule } from './spell-check/spell-check.module';
import { NotificationComponent } from './notification/notification.component';
@NgModule({
    declarations: [SettingsComponent, MappingComponent, SpellcheckComponent, NotificationComponent],
    imports: [
        CommonModule,
        DialogModule,
        TabViewModule,
        TableModule,
        FormsModule,
        ButtonModule,
        InputNumberModule,
        FieldsetModule,
        RadioButtonModule,
        PickListModule,
        ReactiveFormsModule,
        MessageModule,
        ToastModule,
        CheckboxModule,
        DropdownModule,
        ProjectReportModule,
        SpellCheckModule,
    ],
    exports: [SettingsComponent],
})
export class SettingsModule {}
