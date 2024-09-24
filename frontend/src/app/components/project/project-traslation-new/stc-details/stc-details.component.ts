import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, takeUntil } from 'rxjs';
import { ResponseStatusEnum } from 'src/Enumerations';
import { StcLengthCalculationService } from 'src/app/core/services/project/project-translation/stc-details-length-calculation.service';
import { StcDetailsService } from 'src/app/core/services/project/project-translation/stc-details.service';

@Component({
    selector: 'app-stc-details',
    templateUrl: './stc-details.component.html',
    styleUrls: ['./stc-details.component.scss'],
})
export class StcDetailsComponent implements OnInit, OnDestroy {
    destroyed$ = new Subject<boolean>();
    constructor(
        public readonly stcDetailsService: StcDetailsService,
        readonly dialogRef: DynamicDialogRef,
        private readonly eventBus: NgEventBus,
        private readonly stcLengthCalculationService: StcLengthCalculationService
    ) {}

    ngOnInit(): void {
        this.calculateLength();
        this.eventBus
            .on('structure:textnodeupdate')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res: MetaData) => {
                    if (res.data['status'] === ResponseStatusEnum.OK) {
                        this.onReject();
                    }
                },
            });
        this.eventBus
            .on('structure:textnodeupdateAfterMappingFromTabel')
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: (res: MetaData) => {
                    if (res.data['status'] === ResponseStatusEnum.OK) {
                        this.onReject();
                    }
                },
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
    }

    onReject(): void {
        this.stcDetailsService.ifRowNotSelect = false;
        this.dialogRef.close();
    }

    private calculateLength(): void {
        this.stcLengthCalculationService.calculateLength();
    }
}
