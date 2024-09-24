import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { PickListModule } from 'primeng/picklist';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SplitterModule } from 'primeng/splitter';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { PlaceholderDatatypePipe } from 'src/app/shared/pipes/placeholder-datatype.pipe';
import { SplitPipe } from 'src/app/shared/pipes/split/split.pipe';
import { FilterPipe } from '../components/project/project-traslation-new/comments/comments-filter.pipe';
import { AssignLabelComponent } from './components/assign-label/assign-label.component';
import { AssignUserComponent } from './components/assign-user/assign-user.component';
import { ChecklistComponent } from './components/check-list/checklist.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { EditableListComponent } from './components/editable-list/editable-list.component';
import { AddTextComponent } from './components/forms/add-text/add-text.component';
import { LabelIconComponent } from './components/label-icon/label-icon.component';
import { OverlayPanelComponent } from './components/overlay-panel/overlay-panel.component';
import { DiffrenceElementComponent } from './customeElement/diffrence-element/diffrence-element.component';
import { StateIconButtonComponent } from './customeElement/state-icon-button/state-icon-button.component';
import { ChunkPipe } from './pipes/chunk.pipe';
import { UtcToLocalTimePipe } from './pipes/datePipe/utc-to-local-time.pipe';
import { FileIconImagePipe } from './pipes/file-icon-image';
import { NodeIconClassPipe } from './pipes/node-icon-class.pipe';
import { TreeModule } from 'primeng/tree';
import { HelpIconComponent } from './components/help-icon/help-icon.component';
import { TableModule } from 'primeng/table';

@NgModule({
    declarations: [
        FileIconImagePipe,
        DiffrenceElementComponent,
        StateIconButtonComponent,
        SplitPipe,
        PlaceholderDatatypePipe,
        UtcToLocalTimePipe,
        FilterPipe,
        ConfirmationComponent,
        LabelIconComponent,
        AssignLabelComponent,
        OverlayPanelComponent,
        ChunkPipe,
        EditableListComponent,
        AddTextComponent,
        ChecklistComponent,
        NodeIconClassPipe,
        AssignUserComponent,
        HelpIconComponent,
    ],
    imports: [
        ListboxModule,
        CheckboxModule,
        ChipModule,
        CommonModule,
        TabViewModule,
        MessageModule,
        MessagesModule,
        FileUploadModule,
        InputTextModule,
        DropdownModule,
        InputTextareaModule,
        ButtonModule,
        DataViewModule,
        ReactiveFormsModule,
        MultiSelectModule,
        ProgressSpinnerModule,
        DialogModule,
        FormsModule,
        ToastModule,
        SplitterModule,
        ConfirmDialogModule,
        TooltipModule,
        PickListModule,
        ConfirmPopupModule,
        PanelModule,
        FieldsetModule,
        EditorModule,
        TreeTableModule,
        TreeModule,
        TableModule,
    ],
    providers: [PlaceholderDatatypePipe, UtcToLocalTimePipe],
    exports: [
        FileIconImagePipe,
        DiffrenceElementComponent,
        StateIconButtonComponent,
        SplitPipe,
        ListboxModule,
        CheckboxModule,
        UtcToLocalTimePipe,
        ChipModule,
        TabViewModule,
        MessageModule,
        MessagesModule,
        FileUploadModule,
        DropdownModule,
        InputTextareaModule,
        ButtonModule,
        DataViewModule,
        ReactiveFormsModule,
        MultiSelectModule,
        ProgressSpinnerModule,
        DialogModule,
        FormsModule,
        CommonModule,
        ToastModule,
        SplitterModule,
        FilterPipe,
        InputTextModule,
        ConfirmationComponent,
        LabelIconComponent,
        OverlayPanelComponent,
        ChunkPipe,
        EditableListComponent,
        AddTextComponent,
        ConfirmPopupModule,
        ChecklistComponent,
        FieldsetModule,
        NodeIconClassPipe,
        EditorModule,
        AssignUserComponent,
        TreeTableModule,
        PanelModule,
        TreeModule,
        TooltipModule,
        HelpIconComponent,
        TableModule,
    ],
})
export class SharedModule {}
