import { Injectable } from '@angular/core';
import { EditableTextModel } from 'src/app/shared/components/editable-list/editable-list.model';

@Injectable({
    providedIn: 'root',
})
export class SpellCheckTransformer {
    transform(response: string[]): EditableTextModel[] {
        return this.words(response);
    }
    words(response: string[]): EditableTextModel[] {
        return response.map((word: string) => ({
            text: word,
            isEditable: false,
            onHover: false,
        }));
    }
}
