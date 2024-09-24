import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrepareProjectComponent } from '../prepare-project/prepare-project/prepare-project.component';
import { EditablePropertiesComponent } from '../project/components/properties/editable-properties.component';
import { ConfirmProjectPropertiesComponent } from '../project/create_project/confirm-project-properties/confirm-project-properties.component';
import { DragAndDropComponent } from '../project/create_project/drag-and-drop/drag-and-drop.component';
import { LanguageInheritanceTreeComponent } from '../project/create_project/language-inheritance/language-inheritance.component';
import { MetadataOfProjectComponent } from '../project/create_project/metadata-of-project/metadata-of-project.component';
import { SelectBaseFileComponent } from '../project/create_project/select-base-file/select-base-file.component';
import { UsersComponent } from '../project/create_project/users/users.component';
import { ConfigurationUpdateComponent } from '../project/update_project/configuration-update/configuration-update.component';
import { SummaryStartExecutionComponent } from '../project/update_project/summary-start-execution/summary-start-execution.component';
import { UpdateXmlComponent } from '../project/update_project/update-xml/update-xml.component';
import { DashboardComponent } from './editor/dashboard.component';
import { ProjectManagerDashboardComponent } from './project-manager-dashboard/project-manager-dashboard.component';
import { ProofreaderDashboardComponent } from './proofreader-dashboard/proofreader-dashboard.component';
import { ReviewerDashboardComponent } from './reviewer-dashboard/reviewer-dashboard.component';
import { TranslationManagerDashboardComponent } from './translation-manager-dashboard/translation-manager-dashboard.component';
import { TranslatorDashboardComponent } from './translator-dashboard/translator-dashboard.component';
import { DataCreatorDashboardComponent } from './data-creator-dashboard/data-creator-dashboard.component';
import { HelpCreatorDashboardComponent } from './help-creator-dashboard/help-creator-dashboard.component';
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: DashboardComponent,
                children: [
                    { path: 'base-file', component: SelectBaseFileComponent },
                    { path: 'language-setting', component: DragAndDropComponent },
                    {
                        path: 'language-inheritance',
                        component: LanguageInheritanceTreeComponent,
                    },
                    {
                        path: 'properties-of-project',
                        component: EditablePropertiesComponent,
                    },
                    {
                        path: 'resource',
                        component: MetadataOfProjectComponent,
                    },
                    {
                        path: 'users',
                        component: UsersComponent,
                    },
                    {
                        path: 'confirmation-of-project',
                        component: ConfirmProjectPropertiesComponent,
                    },
                    { path: 'upload-xml/:id', component: UpdateXmlComponent },
                    {
                        path: 'update-configuration/:id',
                        component: ConfigurationUpdateComponent,
                    },
                    {
                        path: 'summary-start-execution/:id',
                        component: SummaryStartExecutionComponent,
                    },
                    {
                        path: 'prepare-project',
                        component: PrepareProjectComponent,
                    },
                ],
            },
            {
                path: 'projectmanager',
                component: ProjectManagerDashboardComponent,
                data: { title: 'project manager' },
            },
            {
                path: 'translationmanager',
                component: TranslationManagerDashboardComponent,
                data: { title: 'translation manager' },
            },
            {
                path: 'translator',
                component: TranslatorDashboardComponent,
                data: { title: 'translator' },
            },
            {
                path: 'proofreader',
                component: ProofreaderDashboardComponent,
                data: { title: 'Proofreader' },
            },
            {
                path: 'reviewer',
                component: ReviewerDashboardComponent,
                data: { title: 'Reviewer' },
            },
            {
                path: 'datacreator',
                component: DataCreatorDashboardComponent,
                data: { title: 'Data Creator' },
            },
            {
                path: 'helpcreator',
                component: HelpCreatorDashboardComponent,
                data: { title: 'Help Creator' },
            },
        ]),
    ],
    exports: [RouterModule],
})
export class DashboardRoutingModule {}
