import { Component, OnInit } from '@angular/core';
import { UnicodeService } from 'src/app/core/services/project/project-translation/unicode.service';

@Component({
    selector: 'app-unicode-view',
    templateUrl: './unicode-view.component.html',
    styleUrls: ['./unicode-view.component.scss'],
})
export class UnicodeViewComponent implements OnInit {
    constructor(public unicodeService: UnicodeService) {}

    ngOnInit(): void {
        this.unicodeService.getTranslationData();
    }
}
