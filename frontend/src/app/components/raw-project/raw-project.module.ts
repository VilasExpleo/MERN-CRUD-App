import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RippleModule } from 'primeng/ripple';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeTableModule } from 'primeng/treetable';
import { SharedModule } from 'src/app/shared/shared.module';
import { RawProjectManageTextnodesComponent } from './manage-textnodes/raw-project-manage-textnodes.component';

@NgModule({
    declarations: [RawProjectManageTextnodesComponent],
    imports: [
        InputTextModule,
        MultiSelectModule,
        DropdownModule,
        RadioButtonModule,
        ChipsModule,
        CheckboxModule,
        TreeTableModule,
        DragDropModule,
        InplaceModule,
        ToolbarModule,
        ContextMenuModule,
        DragDropModule,
        FormsModule,
        ConfirmDialogModule,
        ListboxModule,
        SharedModule,
        RippleModule,
    ],
    providers: [MessageService, ConfirmationService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RawProjectModule {}
