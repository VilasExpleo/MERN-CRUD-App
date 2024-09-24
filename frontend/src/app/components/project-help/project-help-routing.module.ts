import { RouterModule, Routes } from '@angular/router';
import { ProjectHelpComponent } from './project-help.component';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
        path: '',
        component: ProjectHelpComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProjectHelpRoutingModule {}
