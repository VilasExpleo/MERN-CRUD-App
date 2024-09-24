import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ReportFormat } from 'src/Enumerations';

@Component({
    selector: 'app-report-preview',
    templateUrl: './report-preview.component.html',
    styleUrls: ['./report-preview.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ReportPreviewComponent {
    @Input()
    previewExcel: string[][] = [];

    @Input()
    format: string;

    @Input()
    tableHeaders: string[] = [];

    @Input()
    preview: any;

    @Input()
    previewError: string;

    reportFormat = ReportFormat;
}
