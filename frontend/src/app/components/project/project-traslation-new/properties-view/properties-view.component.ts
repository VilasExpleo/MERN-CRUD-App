import { Component } from '@angular/core';
import { TextNodePropertiesService } from 'src/app/core/services/project/project-translation/text-node-properties.service';

@Component({
    selector: 'app-properties-view',
    templateUrl: './properties-view.component.html',
    styleUrls: ['./properties-view.component.scss'],
})
export class PropertiesViewComponent {
    constructor(public textNodePropertiesService: TextNodePropertiesService) {}
}
