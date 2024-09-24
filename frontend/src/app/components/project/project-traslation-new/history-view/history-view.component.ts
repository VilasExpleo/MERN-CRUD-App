import { Component, OnInit } from '@angular/core';
import { TextnodeHistoryService } from 'src/app/core/services/project/project-translation/textnode-history.service';
import { tableIcons } from 'src/Enumerations';

@Component({
    selector: 'app-history-view',
    templateUrl: './history-view.component.html',
})
export class HistoryViewComponent implements OnInit {
    tableColumns = [];
    textNodeIcon = tableIcons;

    constructor(public textnodeHistoryService: TextnodeHistoryService) {}

    ngOnInit(): void {
        this.tableColumns = this.textnodeHistoryService.getColumnData();
    }
}
