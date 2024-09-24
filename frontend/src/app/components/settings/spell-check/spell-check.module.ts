import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProjectReportModule } from '../../Reports/project-report/project-report.module';
import { SpellCheckComponent } from './spell-check/spell-check.component';
import { TableModule } from 'primeng/table';
import { AutomaticSpellcheckComponent } from './spell-check/automatic-spellcheck/automatic-spellcheck.component';
@NgModule({
    declarations: [SpellCheckComponent, AutomaticSpellcheckComponent],
    exports: [SpellCheckComponent],
    imports: [CommonModule, SharedModule, ProjectReportModule, TableModule],
})
export class SpellCheckModule {}
