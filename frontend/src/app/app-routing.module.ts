import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login/login.component';
import { ProjectHelpComponent } from './components/project-help/project-help.component';
import { ProjectTranslationComponent } from './components/project/project-traslation-new/project-translation.component';
import { RawProjectManageTextnodesComponent } from './components/raw-project/manage-textnodes/raw-project-manage-textnodes.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';
import { PageContextResolver } from './core/services/project/project-help/project-help.resolver';

const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    {
        path: 'main',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'dashboard',
                loadChildren: () =>
                    import('src/app/components/dashboard/dashboard.module').then((m) => m.DashboardModule),
            },
            {
                path: 'sample-text-catalog',
                loadChildren: () =>
                    import('src/app/components/sample-text-catalog/sample-text-catalog.module').then(
                        (m) => m.SampleTextCatalogModule
                    ),
            },
            {
                path: 'lengthcalculation-and-fonts',
                loadChildren: () =>
                    import('src/app/components/length-calculation-and-fonts/length-calculation-and-fonts.module').then(
                        (m) => m.LengthCalculationAndFontsModule
                    ),
            },
            {
                path: 'project-translation',
                component: ProjectTranslationComponent,
                data: { title: 'project-translation' },
            },
            {
                path: 'raw-project-textnodes/:rawProjectId',
                component: RawProjectManageTextnodesComponent,
                data: { title: 'raw-project-textnodestitle' },
            },
            {
                path: 'project-help',
                loadChildren: () =>
                    import('./components/project-help/project-help.module').then((m) => m.ProjectHelpModule),
                component: ProjectHelpComponent,
                resolve: { pageContext: PageContextResolver },
            },
        ],
    },
    { path: '**', redirectTo: '' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [PageContextResolver],
})
export class AppRoutingModule {}
