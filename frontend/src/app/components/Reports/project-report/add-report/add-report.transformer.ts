import { Injectable } from '@angular/core';
import { ReportFormatResponseModel } from 'src/app/shared/models/reports/report-format.response.model';
import { RoleResponseModel } from 'src/app/shared/models/reports/role-response.model';
import { RoleModel } from 'src/app/shared/models/role';
import { AddReportOptionsModel, ReportFormatModel } from './add-report.model';

@Injectable({
    providedIn: 'root',
})
export class AddReportTransformer {
    transform(roles: RoleResponseModel[], formats: ReportFormatResponseModel[]): AddReportOptionsModel {
        return {
            roles: this.getTransformedRoles(roles),
            formats: this.getTransformedFormats(formats),
        };
    }

    private getTransformedRoles(roles: RoleResponseModel[]): RoleModel[] {
        return (
            roles?.map((role: RoleResponseModel) => ({
                id: role.id,
                role: role.role,
            })) ?? []
        );
    }

    private getTransformedFormats(formats: ReportFormatResponseModel[]): ReportFormatModel[] {
        return (
            formats?.map((format: ReportFormatResponseModel) => ({
                id: format.id,
                format: format.format,
            })) ?? []
        );
    }
}
