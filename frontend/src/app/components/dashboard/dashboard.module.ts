import { CommonModule, DecimalPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './editor/dashboard.component';
// Create Project

// Update Project
import { ProjectUpdateModule } from '../project/update_project/project-update.module';

// Primeng
import { defineCustomElements } from 'igniteui-dockmanager/loader';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SplitterModule } from 'primeng/splitter';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { UtcToLocalTimePipe } from 'src/app/shared/pipes/datePipe/utc-to-local-time.pipe';
import { SharedModule } from 'src/app/shared/shared.module';
import { GridComponent } from '../../shared/components/grid/grid.component';
import { ExportModule } from '../export/export.module';
import { PrepareProjectModule } from '../prepare-project/prepare-project.module';
import { ProjectManagerModule } from '../project-manager/project-manager.module';
import { ProjectComponentsModule } from '../project/components/project-components.module';
import { CreateProjectModule } from '../project/create_project/create-project.module';
import { ProjectPropertiesModule } from '../project/project-properties/project-properties.module';
import { ProjectTraslationNewModule } from '../project/project-traslation-new/project-traslation-new.module';
import { SettingsModule } from '../settings/settings.module';
import { TranslationManagerModule } from '../translation-manager/translation-manager.module';
import { DoughnutChartComponent } from './charts/doughnut-chart/doughnut-chart.component';
import { DeleteCommentsComponent } from './delete-comments/delete-comments.component';
import { ReviewerRequestsComponent } from './editor/reviewer-requests/reviewer-requests.component';
import { CreateLabelComponent } from './label-manager/label-form/label-form.component';
import { LabelGridComponent } from './label-manager/label-grid/label-grid.component';
import { LabelManagerComponent } from './label-manager/label-manager.component';
import { OrderReviewAssignmentComponent } from './order-review/components/assignment/assignment.component';
import { OrderReviewDocumentsComponent } from './order-review/components/document/documents.component';
import { OrderReviewLanguageComponent } from './order-review/components/language/language.component';
import { OrderReviewStatisticsComponent } from './order-review/components/statistics/statistics.component';
import { OrderReviewComponent } from './order-review/order-review.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { CompleteTranslationRequestComponent } from './project-manager-dashboard/components/dialogs/complete-translation-request/complete-translation-request.component';
import { NoLanguageComponent } from './project-manager-dashboard/components/dialogs/no-language/no-language.component';
import { TranslationRequestGridComponent } from './project-manager-dashboard/components/grid/translation-request-grid.component';
import { ProjectManagerDashboardComponent } from './project-manager-dashboard/project-manager-dashboard.component';
import { ProofreaderDashboardComponent } from './proofreader-dashboard/proofreader-dashboard.component';
import { ProjectCreationReportComponent } from './reports/project-creation-report/project-creation-report.component';
import { FinishReviewRequestComponent } from './reviewer-dashboard/finish-review-request/finish-review-request.component';
import { ReviewerDashboardComponent } from './reviewer-dashboard/reviewer-dashboard.component';
import { TranslationManagerDashboardComponent } from './translation-manager-dashboard/translation-manager-dashboard.component';
import { TranslationRequestModule } from './translation-request/translation-request.module';
import { TranslatorDashboardComponent } from './translator-dashboard/translator-dashboard.component';
import { VersionHistoryComponent } from './version-history/version-history.component';
import { DataCreatorDashboardComponent } from './data-creator-dashboard/data-creator-dashboard.component';
import { RawProjectGridComponent } from './data-creator-dashboard/raw-project-grid/raw-project-grid.component';
import { CreateRawProjectComponent } from './data-creator-dashboard/create-raw-project-dialog/create-raw-project.component';
import { ManageRawProjectLanguageComponent } from './data-creator-dashboard/create-raw-project-dialog/language/manage-raw-project-language.component';
import { ManageRawProjectDetailsComponent } from './data-creator-dashboard/create-raw-project-dialog/projectDetails/manage-raw-project-details.component';
import { DividerModule } from 'primeng/divider';
import { ManageRawProjectVerificationComponent } from './data-creator-dashboard/create-raw-project-dialog/verification/manage-raw-project-verification.component';
import { AssignEditorComponent } from './data-creator-dashboard/raw-project-grid/assign-editor/assign-editor.component';
import { HelpCreatorDashboardComponent } from './help-creator-dashboard/help-creator-dashboard.component';
import { HelpPageComponent } from './help-creator-dashboard/help-page/help-page.component';
import { HelpIndexComponent } from './help-creator-dashboard/help-index/help-index.component';
import { ReassignWorkerComponent } from './translation-manager-dashboard/reassign-translator/reassign-translator.component';
import { ReassignTranslationManagerComponent } from './project-manager-dashboard/components/dialogs/reassign-translation-manager/reassign-translation-manager.component';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ReassignProofreaderComponent } from './translation-manager-dashboard/reassign-proofreader/reassign-proofreader.component';
defineCustomElements();
@NgModule({
    declarations: [
        DashboardComponent,
        DoughnutChartComponent,
        ProjectCreationReportComponent,
        ProjectManagerDashboardComponent,
        TranslationManagerDashboardComponent,
        TranslatorDashboardComponent,
        ProjectDetailsComponent,
        VersionHistoryComponent,
        CompleteTranslationRequestComponent,
        NoLanguageComponent,
        TranslationRequestGridComponent,
        ProofreaderDashboardComponent,
        OrderReviewComponent,
        OrderReviewAssignmentComponent,
        OrderReviewLanguageComponent,
        OrderReviewDocumentsComponent,
        OrderReviewStatisticsComponent,
        ReviewerDashboardComponent,
        GridComponent,
        FinishReviewRequestComponent,
        ReviewerRequestsComponent,
        DeleteCommentsComponent,
        LabelManagerComponent,
        LabelGridComponent,
        CreateLabelComponent,
        DataCreatorDashboardComponent,
        RawProjectGridComponent,
        CreateRawProjectComponent,
        ManageRawProjectLanguageComponent,
        ManageRawProjectDetailsComponent,
        ManageRawProjectVerificationComponent,
        AssignEditorComponent,
        HelpCreatorDashboardComponent,
        HelpPageComponent,
        HelpIndexComponent,
        ReassignWorkerComponent,
        ReassignTranslationManagerComponent,
        ReassignProofreaderComponent,
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        StepsModule,
        DialogModule,
        TableModule,
        ToastModule,
        CalendarModule,
        SliderModule,
        MultiSelectModule,
        ContextMenuModule,
        ButtonModule,
        DropdownModule,
        TranslationRequestModule,
        ProgressBarModule,
        InputTextModule,
        RatingModule,
        SlideMenuModule,
        InputTextareaModule,
        RadioButtonModule,
        MessageModule,
        TabViewModule,
        TreeModule,
        VirtualScrollerModule,
        ProgressSpinnerModule,
        MessagesModule,
        CardModule,
        SplitterModule,
        PanelModule,
        ChartModule,
        ProjectTraslationNewModule,
        ConfirmDialogModule,
        PrepareProjectModule,
        SharedModule,
        TranslationManagerModule,
        ProjectManagerModule,
        ProjectPropertiesModule,
        CreateProjectModule,
        ExportModule,
        ProjectUpdateModule,
        ProjectComponentsModule,
        ChipModule,
        PickListModule,
        FileUploadModule,
        SettingsModule,
        ColorPickerModule,
        DividerModule,
        OverlayPanelModule,
    ],
    providers: [DecimalPipe, UtcToLocalTimePipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardModule {}
