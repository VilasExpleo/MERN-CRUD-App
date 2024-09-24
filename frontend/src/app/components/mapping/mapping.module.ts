import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MappingComponent } from './mapping.component';
import { MappingProposalsComponent } from './mapping-proposals/mapping-proposals.component';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { StcDetailsComponent } from './stc-details/stc-details.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
@NgModule({
    declarations: [MappingComponent, MappingProposalsComponent, StcDetailsComponent],
    imports: [CommonModule, TableModule, MessageModule, MessagesModule, DialogModule, ButtonModule, ToastModule],
    exports: [MappingProposalsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MappingModule {}
