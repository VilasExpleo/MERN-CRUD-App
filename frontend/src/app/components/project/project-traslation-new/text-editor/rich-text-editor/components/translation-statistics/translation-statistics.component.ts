import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { NgChanges } from 'src/app/shared/models/ng-on-changes/ng-on-changes';
import { TranslationStatisticsModel } from './translation-statistics.model';

@Component({
    selector: 'app-translation-statistics',
    templateUrl: './translation-statistics.component.html',
})
export class TranslationStatisticsComponent implements OnChanges {
    @Input()
    model: TranslationStatisticsModel;

    @Output()
    unresolvedSymbolsEvent = new EventEmitter();

    ngOnChanges(changes: NgChanges<TranslationStatisticsComponent>): void {
        this.model = changes.model.currentValue;
    }

    get textWidth() {
        return this.model.linesWidth?.length > 0 ? Math.max.apply(0, this.model.linesWidth) : 0;
    }

    showUnresolvedChars() {
        this.unresolvedSymbolsEvent.emit();
    }
}
