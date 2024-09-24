import { NgModule } from '@angular/core';
import { ProjectHelpIndexComponent } from './project-help-index/project-help-index.component';
import { ProjectHelpComponent } from './project-help.component';
import { ProjectHelpListComponent } from './project-help-index/project-help-list/project-help-list.component';
import { SharedModule } from '../../shared/shared.module';
import { ProjectHelpRoutingModule } from './project-help-routing.module';
import { ProjectHelpSearchComponent } from './project-help-index/project-help-search/project-help-search.component';
import { BookmarksComponent } from './project-help-index/bookmarks/bookmarks.component';

@NgModule({
    declarations: [
        ProjectHelpComponent,
        ProjectHelpIndexComponent,
        ProjectHelpListComponent,
        ProjectHelpSearchComponent,
        BookmarksComponent,
    ],
    imports: [SharedModule, ProjectHelpRoutingModule],
})
export class ProjectHelpModule {}
