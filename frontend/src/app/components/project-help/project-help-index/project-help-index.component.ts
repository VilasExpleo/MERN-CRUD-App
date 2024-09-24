import { Component, OnInit } from '@angular/core';
import { ProjectHelpService } from 'src/app/core/services/project/project-help/project-help.service';
import { Column } from '../../dashboard/help-creator-dashboard/help-index/help-index.model';
import { ProjectHelpIndexModel } from './project-help-index.model';
import { ProjectHelpTabs } from './project-help.enum';

@Component({
    selector: 'app-project-help-index',
    templateUrl: './project-help-index.component.html',
})
export class ProjectHelpIndexComponent implements OnInit {
    pages: ProjectHelpIndexModel[] = [];
    cols: Column[] = [];

    constructor(private readonly projectHelpService: ProjectHelpService) {}

    ngOnInit(): void {
        this.cols = [{ field: 'pageTitle', header: 'Create Page' }];
        this.getPages();
    }

    tabChange(index: number) {
        switch (index) {
            case ProjectHelpTabs.Pages:
                this.projectHelpService.setSelectedTab(ProjectHelpTabs.Pages);
                return;
            case ProjectHelpTabs.Search:
                this.projectHelpService.setSelectedTab(ProjectHelpTabs.Search);
                return;
            default:
                return;
        }
    }

    private getPages(): void {
        this.projectHelpService.getHelpPages().subscribe((response: ProjectHelpIndexModel[]) => {
            this.pages = response ?? [];
        });
    }
}
