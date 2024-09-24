import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { EditTextModel } from './edit-text.model';
import { EditableTextModel } from './editable-list.model';

@Component({
    selector: 'app-editable-list',
    templateUrl: './editable-list.component.html',
})
export class EditableListComponent {
    @Input()
    list$: Observable<EditableTextModel[]>;

    @Input()
    placeholder: string;

    @Input()
    attributeName: string;

    @Input()
    enableSearch: boolean;

    @Input()
    duplicateValidation: boolean;

    @Input()
    buttonLabel: string;

    @Output()
    cancelEvent = new EventEmitter<EditableTextModel>();

    @Output()
    addEvent = new EventEmitter<string>();

    @Output()
    editEvent = new EventEmitter<EditTextModel>();

    @Output()
    deleteAllEvent = new EventEmitter<void>();

    @Output()
    deleteTextEvent = new EventEmitter<string>();

    editableTextModel: EditableTextModel;

    onMouseEnter(editableText: EditableTextModel) {
        editableText.onHover = !editableText.onHover;
    }

    onMouseLeave(editableText: EditableTextModel) {
        editableText.onHover = !editableText.onHover;
    }

    OnMarkEditable(event, editableText: EditableTextModel): void {
        event.stopPropagation();
        this.editableTextModel = editableText;
        editableText.isEditable = !editableText.isEditable;
    }

    onCancel(event, editableText: EditableTextModel) {
        event.stopPropagation();
        editableText.isEditable = !editableText.isEditable;
    }

    addText(payload: string) {
        this.addEvent.emit(payload);
    }

    editText(text: string) {
        const editText: EditTextModel = {
            newText: text,
            oldText: this.editableTextModel?.text,
        };
        this.editEvent.emit(editText);
    }

    delete(text: string) {
        this.deleteTextEvent.emit(text);
    }

    deleteAllText() {
        this.deleteAllEvent.emit();
    }
}
