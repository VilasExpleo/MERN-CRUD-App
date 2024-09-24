import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { iconBaseUrl } from 'src/app/shared/config/config';
import { SampleTextCatalogService } from '../../../../../core/services/sample-text-catalog-service/sample-text-catalog.service';

@Component({
    selector: 'app-project-reference',
    templateUrl: './project-reference.component.html',
    styleUrls: ['./project-reference.component.scss'],
})
export class ProjectReferenceComponent implements OnInit {
    baseURL: string = iconBaseUrl;
    displayProjectReference = false;
    projectTextAttribute;
    sampleTextAttribute;

    constructor(private sampleTextCatalogService: SampleTextCatalogService, private config: DynamicDialogConfig) {}

    ngOnInit(): void {
        this.projectTextAttribute = this.config?.data;
    }
    externalProjectReference(stc_id) {
        const postObj: any = {
            stc_id: stc_id,
        };
        this.sampleTextCatalogService
            .externalProjectReference('stc-group/stc-external-reference', postObj)
            .subscribe((res: any) => {
                if (res['status'] == 'OK') {
                    if (res['data'] !== null) {
                        if (res['data']) {
                            res['data'].map((node) => {
                                this.projectTextAttribute.push(node);
                            });
                        }
                    }
                }
            });
    }
}
