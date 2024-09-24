import { Pipe, PipeTransform } from '@angular/core';
import { ProjectReportModel } from '../../generate-report/generate-report.model';

@Pipe({
    name: 'reportFilter',
})
export class ReportFilterPipe implements PipeTransform {
    transform(reports: ProjectReportModel[], searchText: string): ProjectReportModel[] {
        if (!reports) {
            return [];
        }

        if (!searchText) {
            return reports;
        }

        return reports.filter(
            (report: ProjectReportModel) =>
                report.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) ||
                report.description?.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
        );
    }
}
