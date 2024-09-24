import { Component, OnDestroy, OnInit } from '@angular/core';
import { IgcDockManagerLayout } from '@infragistics/igniteui-dockmanager';
import { DashboardLayoutService } from '../../../core/services/layoutConfiguration/dashboard-layout.service';
import { Subject, takeUntil } from 'rxjs';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';

@Component({
    selector: 'app-data-creator-dashboard',
    templateUrl: './data-creator-dashboard.component.html',
    styleUrls: ['../dashboard.component.scss'],
})
export class DataCreatorDashboardComponent implements OnInit, OnDestroy {
    destroyed$ = new Subject<boolean>();
    isLoading = false;
    layout: IgcDockManagerLayout;
    dockRawProjectsTitle = 'Projects';

    constructor(private layoutService: DashboardLayoutService, private eventBus: NgEventBus) {}

    ngOnInit(): void {
        this.layout = this.layoutService.getlayoutDataCreator(this.dockRawProjectsTitle);
        this.eventBus
            .on('rawProjectRequest:totalCount')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (meta: MetaData) => {
                    this.dockRawProjectsTitle = 'Projects: ' + meta.data;
                    this.layout = this.layoutService.getlayoutDataCreator(this.dockRawProjectsTitle);
                },
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
    }

    loadingOnChange(value: boolean) {
        this.isLoading = value;
    }
}
