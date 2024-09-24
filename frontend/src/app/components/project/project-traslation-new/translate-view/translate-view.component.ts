import { Component, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { MenuItem } from 'primeng/api';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';

@Component({
    selector: 'app-translate-view',
    templateUrl: './translate-view.component.html',
    styleUrls: ['./translate-view.component.scss'],
})
export class TranslateViewComponent implements OnInit {
    breadcrumbItems: MenuItem[] = [];
    constructor(
        private eventBus: NgEventBus,
        public mappingService: MappingService,
        public projectTranslationService: ProjectTranslationService
    ) {}

    ngOnInit(): void {
        this.onLoad();
    }
    onLoad() {
        this.eventBus.on('structure:breadcrumb').subscribe({
            next: (res: MetaData) => {
                this.breadcrumbItems = res.data;
            },
            error: (err) => {
                console.warn(err);
            },
        });
    }
}
