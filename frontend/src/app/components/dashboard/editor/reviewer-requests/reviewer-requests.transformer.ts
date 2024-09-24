import { Injectable } from '@angular/core';
import { GridHeaderModel } from 'src/app/shared/components/grid/grid.model';
import { GridTransformer } from 'src/app/shared/components/grid/grid.transformer';
import { ReviewerRequestsModel } from './reviewer-requests.model';
import { ReviewRequestStatus } from 'src/Enumerations';

@Injectable({
    providedIn: 'root',
})
export class ReviewerRequestsTransformer {
    constructor(private gridTransformer: GridTransformer) {}

    transform(response): ReviewerRequestsModel {
        return {
            grid: this.gridTransformer.transform(
                response,
                this.getColsConfiguration(),
                this.getColsConfigurationForRowSpan()
            ),
        };
    }

    private getColsConfiguration(): GridHeaderModel[] {
        return [
            {
                field: 'projectName',
                header: 'Project',
            },
            {
                field: 'version',
                header: 'Version',
                filter: { type: 'numeric' },
            },
            {
                field: 'dueDate',
                header: 'Due Date',
                filter: { type: 'date' },
            },
            {
                field: 'sourceLanguage',
                header: 'Source Language',
            },
            {
                field: 'reviewType',
                header: 'Review Type',
                sort: false,
                filter: false,
            },
            {
                field: 'status',
                header: 'Order Status',
                filter: {
                    type: '',
                    template: { statuses: this.getStatues() },
                },
            },
            {
                field: 'returnCount',
                header: 'Returned',
            },
            {
                field: 'attachment',
                header: 'Attachments',
                sort: false,
                filter: false,
            },
        ];
    }

    private getColsConfigurationForRowSpan(): GridHeaderModel[] {
        return [
            {
                field: 'reviewerEmail',
                header: 'Reviewer',
                filter: false,
                sort: false,
            },
            {
                field: 'progress',
                header: 'Review Progress',
                filter: false,
                sort: false,
            },
            {
                field: 'status',
                header: 'Review Status',
                filter: false,
                sort: false,
            },
            {
                field: 'returnDate',
                header: 'Returned',
                filter: false,
                sort: false,
            },
        ];
    }

    private getStatues() {
        return Object.keys(ReviewRequestStatus).map((key: string) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: ReviewRequestStatus[key],
        }));
    }
}
