import { Component, Input } from '@angular/core';
import { ParserConfigModel } from './parser-config/parser-config-item/parser-config.model';

@Component({
    selector: 'app-resources',
    templateUrl: './resources.component.html',
})
export class ResourcesComponent {
    @Input()
    parserConfigModel: ParserConfigModel;
}
