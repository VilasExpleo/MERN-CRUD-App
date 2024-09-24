import { AfterViewChecked, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TreeTable } from 'primeng/treetable';
import { ProjectHelpService } from '../../../../core/services/project/project-help/project-help.service';
import { Column } from '../../../dashboard/help-creator-dashboard/help-index/help-index.model';
import { ProjectHelpIndexModel } from '../project-help-index.model';
import { ProjectHelpTabs } from '../project-help.enum';

@Component({
    selector: 'app-project-help-list',
    templateUrl: './project-help-list.component.html',
})
export class ProjectHelpListComponent implements OnInit, OnChanges, AfterViewChecked {
    @Input() pages: ProjectHelpIndexModel[] = [];
    @Input() cols: Column[] = [];
    selectedRow: ProjectHelpIndexModel;

    @ViewChild('projectHelpListTable') projectHelpListTable: TreeTable;

    constructor(private readonly route: ActivatedRoute, private readonly projectHelpService: ProjectHelpService) {}

    ngOnInit(): void {
        this.handleTabChange();
    }

    ngOnChanges() {
        this.findPage(this.pages, this.route.snapshot.data?.['pageContext']?.pageId);
    }

    ngAfterViewChecked(): void {
        if (this.pages.length > 0) {
            this.scrollToSelectedNode();
        }
    }

    selectionChange() {
        if (this.selectedRow) {
            this.projectHelpService.setPageState(this.selectedRow);
        }
    }

    private findPage(pages: ProjectHelpIndexModel[], id: number): void {
        if (pages.length === 0) {
            return;
        }
        for (const page of pages) {
            if (page.data.pageId === id) {
                this.selectedRow = page;
                break;
            }
            if (page.children) {
                page['expanded'] = true;
                this.findPage(page.children, id);
            }
        }
    }

    private scrollToSelectedNode(): void {
        this.projectHelpListTable.el.nativeElement.querySelectorAll('tr.p-element.p-highlight')[0]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
        });
    }

    private handleTabChange(): void {
        this.projectHelpService.getSelectedTab().subscribe((index: number) => {
            if (index === ProjectHelpTabs.Pages) {
                this.selectionChange();
            }
        });
    }
}
