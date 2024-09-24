import { Injectable } from '@angular/core';
import { PreviewReportResponseModel } from 'src/app/shared/models/reports/preview-report.response.model';
import { ReportPreviewModel } from './report-preview.model';

@Injectable({
    providedIn: 'root',
})
export class PreviewReportTransformer {
    transform(previewReportResponseModel: PreviewReportResponseModel): ReportPreviewModel {
        return {
            report: previewReportResponseModel.reportData,
            format: previewReportResponseModel.reportFormat,
        };
    }
}
