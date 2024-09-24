import { Component, OnInit } from '@angular/core';
import { ProjectHelpService } from 'src/app/core/services/project/project-help/project-help.service';
import { ProjectHelpIndexModel } from '../project-help-index.model';
import { ProjectHelpTabs } from '../project-help.enum';
import { ProjectHelpSearchModel } from './project-help-search.model';

@Component({
    selector: 'app-project-help-search',
    templateUrl: './project-help-search.component.html',
})
export class ProjectHelpSearchComponent implements OnInit {
    searchedPages: ProjectHelpSearchModel[] = [];
    selectedPage: ProjectHelpSearchModel;

    constructor(private readonly projectHelpService: ProjectHelpService) {}

    ngOnInit(): void {
        this.getSearchedPages();
        this.onTabChangeSelectRow();
    }

    onSearch(value: string): void {
        this.projectHelpService.setSearchText(value);
    }

    onSelection(value: ProjectHelpSearchModel) {
        const payload: ProjectHelpIndexModel = {
            data: {
                ...value,
                id: 0,
                parentPageId: 0,
            },
        };
        this.projectHelpService.setPageState(payload);
    }

    private getSearchedPages(): void {
        this.projectHelpService.getFilteredPage().subscribe((response: ProjectHelpSearchModel[]) => {
            if (!response.length) {
                this.selectedPage = null;
            }
            this.searchedPages = response ?? [];
        });
    }

    private onTabChangeSelectRow(): void {
        this.projectHelpService.getSelectedTab().subscribe((index: number) => {
            if (index === ProjectHelpTabs.Search) {
                this.selectedPage && this.onSelection(this.selectedPage);
            }
        });
    }
}
