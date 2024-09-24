import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChecklistModel } from '../../models/TranslationRequest/checklist.model';

@Component({
    selector: 'app-checklist',
    templateUrl: './checklist.component.html',
})
export class ChecklistComponent {
    @Input()
    checklist: ChecklistModel[];

    @Input()
    showCheckbox: boolean;

    @Input()
    header: string;

    @Input()
    isToggle: boolean;

    @Input()
    isTaskChecklist: boolean;

    @Output()
    updateCheckListEvent = new EventEmitter<ChecklistModel[]>();

    update() {
        this.updateCheckListEvent.emit(this.checklist);
    }
}
