import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable, take } from 'rxjs';
import { TranslationRequestService } from 'src/app/core/services/translation-request/translation-request.service';
import { EditTextModel } from 'src/app/shared/components/editable-list/edit-text.model';
import { EditableTextModel } from 'src/app/shared/components/editable-list/editable-list.model';
@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit {
    checklist$: Observable<EditableTextModel[]>;
    placeholder = 'Add custom checklist';

    @Output()
    navigationEvent = new EventEmitter<number>();

    constructor(private translationRequestService: TranslationRequestService) {}

    ngOnInit() {
        this.getChecklist();
    }

    getChecklist() {
        this.checklist$ = this.translationRequestService.getChecklistState();
    }

    add(check: string) {
        this.checklist$.pipe(take(1)).subscribe((checklists: EditableTextModel[]) => {
            const addCheckList = [...checklists, { text: check }];
            this.translationRequestService.setChecklistState(addCheckList);
        });
        this.getChecklist();
    }

    edit(editTextModel: EditTextModel) {
        this.checklist$.pipe(take(1)).subscribe((checklists: EditableTextModel[]) => {
            const updatedCheckList = checklists.map((checkList: EditableTextModel) => {
                if (checkList.text === editTextModel.oldText) {
                    return { ...checkList, text: editTextModel.newText, isEditable: false };
                } else {
                    return checkList;
                }
            });
            this.translationRequestService.setChecklistState(updatedCheckList);
        });
        this.getChecklist();
    }

    deleteList(text: string) {
        this.checklist$.pipe(take(1)).subscribe((checklists: EditableTextModel[]) => {
            const updatedChecklist = checklists.filter((check: EditableTextModel) => check.text !== text);
            this.translationRequestService.setChecklistState(updatedChecklist);
        });
        this.getChecklist();
    }

    navigate(index: number) {
        this.navigationEvent.emit(index);
    }
}
