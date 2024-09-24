import { Component, Input } from '@angular/core';
import { ReferenceLanguageModel } from './reference-languages.model';

@Component({
    selector: 'app-reference-languages',
    templateUrl: './reference-languages.component.html',
})
export class ReferenceLanguagesComponent {
    @Input()
    referenceLanguages: ReferenceLanguageModel[];
}
