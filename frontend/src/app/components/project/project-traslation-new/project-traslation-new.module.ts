import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { defineCustomElements } from 'igniteui-dockmanager/loader';
import { ConfirmationService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { ColumnConfigPopupModule } from 'src/app/core/dynamic-popups/translation/table/column-configuration/column-configuration.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MappingModule } from '../../mapping/mapping.module';
import { CommentsComponent } from './comments/comments.component';
import { CreateCommentComponent } from './comments/create-comment/create-comment.component';
import { DeleteCommentsComponent } from './comments/delete-comments/delete-comments.component';
import { FontCharacterComponent } from './font-characters/font-character.component';
import { CompressComponent } from './grammmar-parser/compress/compress.component';
import { DecompressComponent } from './grammmar-parser/decompress/decompress.component';
import { GrammarParserComponent } from './grammmar-parser/grammar-parser.component';
import { TranslateComponent } from './grammmar-parser/translate/translate.component';
import { HeaderTranslationComponent } from './header-translation/header-translation.component';
import { HistoryViewComponent } from './history-view/history-view.component';
import { LayoutConfigurationComponent } from './layout-configuration/layout-configuration.component';
import { LockUnlockViewComponent } from './lock-unlock-view/lock-unlock-view.component';
import { MappingProposalComponent } from './mapping-proposal/mapping-proposal.component';
import { PlaceholderDetailDialogComponent } from './placeholder-detail-dialog/placeholder-detail-dialog.component';
import { ProjectTranslationComponent } from './project-translation.component';
import { PropertiesViewComponent } from './properties-view/properties-view.component';
import { ReferencesComponent } from './references/references.component';
import { ScreenshotsComponent } from './references/screenshots/screenshots.component';
import { StcDetailsComponent } from './stc-details/stc-details.component';
import { StructureViewComponent } from './structure-view/structure-view.component';
import { ErrorLogsComponent } from './tab-view/error-logs/error-logs.component';
import { TabViewComponent } from './tab-view/tab-view.component';
import { LabelFilterComponent } from './table-view/label-filter/label-filter.component';
import { TableViewComponent } from './table-view/table-view.component';
import { RichTextEditorModule } from './text-editor/rich-text-editor/rich-text-editor.module';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { TranslationStatusBarComponent } from './text-editor/translation-status-bar/translation-status-bar.component';
import { TranslateViewComponent } from './translate-view/translate-view.component';
import { TranslationHistoryComponent } from './translation-history/translation-history.component';
import { UnicodeViewComponent } from './unicode-view/unicode-view.component';
defineCustomElements();
@NgModule({
    declarations: [
        ProjectTranslationComponent,
        HistoryViewComponent,
        TableViewComponent,
        StructureViewComponent,
        UnicodeViewComponent,
        PropertiesViewComponent,
        LayoutConfigurationComponent,
        TranslateViewComponent,
        LockUnlockViewComponent,
        HeaderTranslationComponent,
        TextEditorComponent,
        StcDetailsComponent,
        MappingProposalComponent,
        TranslationHistoryComponent,
        PlaceholderDetailDialogComponent,
        TranslationStatusBarComponent,
        CommentsComponent,
        CreateCommentComponent,
        DeleteCommentsComponent,
        ReferencesComponent,
        ScreenshotsComponent,
        TabViewComponent,
        LabelFilterComponent,
        ErrorLogsComponent,
        FontCharacterComponent,
        GrammarParserComponent,
        DecompressComponent,
        CompressComponent,
        TranslateComponent,
    ],
    imports: [
        CommonModule,
        TabViewModule,
        TreeTableModule,
        TableModule,
        ProgressSpinnerModule,
        MessageModule,
        MessagesModule,
        ReactiveFormsModule,
        ButtonModule,
        MultiSelectModule,
        DropdownModule,
        FormsModule,
        HttpClientModule,
        InputTextModule,
        InputTextareaModule,
        ContextMenuModule,
        DialogModule,
        PickListModule,
        CheckboxModule,
        TooltipModule,
        ProgressBarModule,
        PanelModule,
        BreadcrumbModule,
        ColumnConfigPopupModule,
        MappingModule,
        ToastModule,
        ConfirmDialogModule,
        TagModule,
        SharedModule,
        InputNumberModule,
        ToolbarModule,
        OverlayPanelModule,
        InputNumberModule,
        ChipModule,
        ToolbarModule,
        RichTextEditorModule,
        DynamicDialogModule,
        MultiSelectModule,
        MenuModule,
        StepsModule,
        ListboxModule,
    ],
    providers: [DatePipe, ConfirmationService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProjectTraslationNewModule {}
