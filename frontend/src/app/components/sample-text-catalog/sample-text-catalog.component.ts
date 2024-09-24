import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { SampleTextCatalogService } from 'src/app/core/services/sample-text-catalog-service/sample-text-catalog.service';

@Component({
    selector: 'app-sample-text-catalog',
    templateUrl: './sample-text-catalog.component.html',
    styleUrls: ['./sample-text-catalog.component.scss'],
    changeDetection: ChangeDetectionStrategy.Default,
})
export class SampleTextCatalogComponent implements OnInit {
    tabIndex = 0;
    state;
    IgcDockManagerLayout: object = {};
    sub: Subscription;
    stcId: number;
    constructor(private sampleTextCatalogService: SampleTextCatalogService, private route: ActivatedRoute) {}
    ngOnInit(): void {
        this.IgcDockManagerLayout = this.sampleTextCatalogService.getlayout();
        this.sub = this.route.paramMap.subscribe((params) => {
            this.stcId = params['params']['Id'] || 0;
            if (this.stcId > 0) {
                this.IgcDockManagerLayout = this.sampleTextCatalogService.setLayoutOnChange(
                    'Details Of Sample Text',
                    this.IgcDockManagerLayout,
                    'stc'
                );
            }
        });
    }
    setLayout(data) {
        this.IgcDockManagerLayout = {
            ...this.sampleTextCatalogService.setLayoutOnChange(data.title, this.IgcDockManagerLayout, data.contentId),
        };
    }
    cancelLayout() {
        this.IgcDockManagerLayout = { ...this.sampleTextCatalogService.cancelLayout(this.IgcDockManagerLayout) };
    }
}
