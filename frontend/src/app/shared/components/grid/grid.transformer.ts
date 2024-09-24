import { DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { RequestPerLanguage, ReviewerResponseModel } from 'src/app/shared/models/reviewer/reviewer-api.model';
import { GridHeaderModel, RequestModel, TargetLanguageRequestModel } from './grid.model';

@Injectable({
    providedIn: 'root',
})
export class GridTransformer {
    constructor(private decimalPipe: DecimalPipe) {}
    transform(requests, cols?: GridHeaderModel[], colsForRowSpan?: GridHeaderModel[]) {
        return {
            requests: this.getGridModel(requests.data),
            cols: this.getColumns(cols),
            colsForRowSpan: this.getColumns(colsForRowSpan),
        };
    }

    private getGridModel(requests: ReviewerResponseModel[]): RequestModel[] {
        return requests.map((request: ReviewerResponseModel) => {
            const remainingTime = new Date(request.dueDate?.trim()).getTime() - new Date().getTime();

            return {
                id: request.requestId,
                document: request.document,
                dueDate: request.dueDate?.trim() ? new Date(request.dueDate?.trim()) : undefined,
                projectName: request.projectName,
                projectId: request.projectId,
                remainingTime: Math.ceil(remainingTime / (1000 * 60 * 60 * 24)),
                version: this.getVersion(request.versionId),
                versionId: request.versionId,
                status: request.status,
                sourceLanguage: request.sourceLanguage.code,
                targetLanguages: this.getRequestPerLanguage(request.targetLanguages),
                returned: request?.returnCount,
                documentCount: request.documentCount,
                reviewType: request?.reviewType,
                lcPath: request?.lcPath,
                fontPath: request?.fontPath,
            };
        });
    }

    private getRequestPerLanguage(requests: RequestPerLanguage[]): TargetLanguageRequestModel[] {
        return requests.map((request: RequestPerLanguage) => ({
            reviewer: request?.reviewerEmail,
            approvedNodes: this.decimalPipe.transform(request.approvedNodes, '2.0-0'),
            pendingNodes: this.decimalPipe.transform(request.pendingNodes, '2.0-0'),
            progress: request.progress,
            rejectedNodes: this.decimalPipe.transform(request.rejectedNodes, '2.0-0'),
            targetLanguageCode: request.targetLanguage.code,
            targetLanguageId: request.targetLanguage.id,
            returnDate: request.returnDate?.trim() ? new Date(request.returnDate?.trim()) : undefined,
            totalTextNodeCount: request.totalTextNodeCount,
            doneNodes: this.decimalPipe.transform(request.doneNodes, '2.0-0'),
        }));
    }

    private getColumns = (cols: GridHeaderModel[]) => {
        return cols.map((col: GridHeaderModel) => ({
            field: col.field,
            header: col.header,
            sort: col.sort ?? true,
            filter: col.filter ?? {
                type: 'text',
            },
            colSpan: col.colSpan,
        }));
    };

    private getVersion = (versionId: number) => {
        return +versionId.toString().split('.')[1];
    };
}
