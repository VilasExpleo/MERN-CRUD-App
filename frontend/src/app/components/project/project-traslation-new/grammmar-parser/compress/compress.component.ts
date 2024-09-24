import { Component } from '@angular/core';

@Component({
    selector: 'app-compress',
    templateUrl: './compress.component.html',
})
export class CompressComponent {
    text: string;

    results: string[];

    addText(text: string) {
        this.results.push(text);
    }
}
