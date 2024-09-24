import { GridService } from './../../../../core/services/grid/grid.service';
import { Component, OnInit } from '@angular/core';
import { TranslationHistoryService } from 'src/app/core/services/project/project-translation/translation-history.service';
import { tableIcons, TextState, TranslationHistoryAttributes } from 'src/Enumerations';

@Component({
    selector: 'app-translation-history',
    templateUrl: './translation-history.component.html',
})
export class TranslationHistoryComponent implements OnInit {
    tableColumns = [];
    tableIcons = tableIcons;

    constructor(public translationHistoryService: TranslationHistoryService, private gridService: GridService) {}

    ngOnInit(): void {
        this.tableColumns = this.translationHistoryService.getColumnData();
    }

    isColumnChangedAttributes(column): boolean {
        return column === 'attribute_name';
    }

    getTranslationHistoryAttributes() {
        return this.gridService.getFilterFromStringEnum({ ...TranslationHistoryAttributes, ...TextState });
    }
}
