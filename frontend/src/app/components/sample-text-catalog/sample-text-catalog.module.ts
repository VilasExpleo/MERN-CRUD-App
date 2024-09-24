import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleTextCatalogRoutingModule } from './sample-text-catalog-routing.module';
import { SampleTextCatalogComponent } from './sample-text-catalog.component';
import { StcGroupComponent } from './stc-data-action/stc-group/stc-group.component';
import { StcCatalogComponent } from './stc-data-action/stc-catalog/stc-catalog.component';
import { StcTableDataComponent } from './stc-data-layout/stc-table-data/stc-table-data.component';
import { ButtonModule } from 'primeng/button';
import { PickListModule } from 'primeng/picklist';
import { DialogModule } from 'primeng/dialog';
import { StcLanguageConfigurationComponent } from './stc-header/stc-language-configuration/stc-language-configuration.component';
import { StcDataActionComponent } from './stc-data-action/stc-data-action.component';
import { StcDataLayoutComponent } from './stc-data-layout/stc-data-layout.component';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { ProjectReferenceComponent } from './stc-data-action/create-stc/project-reference/project-reference.component';
import { StcHeaderComponent } from './stc-header/stc-header.component';
import { StcStructureDataComponent } from './stc-data-layout/stc-structure-data/stc-structure-data.component';
import { ToastModule } from 'primeng/toast';
import { ContextMenuModule } from 'primeng/contextmenu';
import { defineCustomElements } from 'igniteui-dockmanager/loader';
import { CreateStcComponent } from './stc-data-action/create-stc/create-stc.component';
import { DescriptionComponent } from './stc-data-action/create-stc/description/description.component';
import { IdealTextComponent } from './stc-data-action/create-stc/ideal-text/ideal-text.component';
import { StcSettingComponent } from './stc-data-action/create-stc/stc-setting/stc-setting.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { NgEventBus } from 'ng-event-bus';
import { StcHistoryComponent } from './stc-history/stc-history.component';
import { SharedModule } from 'src/app/shared/shared.module';
defineCustomElements();
@NgModule({
    declarations: [
        SampleTextCatalogComponent,
        StcGroupComponent,
        StcCatalogComponent,
        StcTableDataComponent,
        StcStructureDataComponent,
        StcLanguageConfigurationComponent,
        StcDataActionComponent,
        StcDataLayoutComponent,
        StcHeaderComponent,
        ProjectReferenceComponent,
        CreateStcComponent,
        DescriptionComponent,
        IdealTextComponent,
        StcSettingComponent,
        StcHistoryComponent,
    ],
    imports: [
        CommonModule,
        SampleTextCatalogRoutingModule,
        ButtonModule,
        ToastModule,
        ContextMenuModule,
        PickListModule,
        DialogModule,
        TabViewModule,
        InputTextareaModule,
        DropdownModule,
        InputTextModule,
        MessagesModule,
        MessageModule,
        TreeTableModule,
        TableModule,
        ButtonModule,
        ReactiveFormsModule,
        FormsModule,
        OverlayPanelModule,
        ConfirmDialogModule,
        BreadcrumbModule,
        SharedModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [NgEventBus],
})
export class SampleTextCatalogModule {}
