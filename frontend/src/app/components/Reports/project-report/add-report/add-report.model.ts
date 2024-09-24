import { RoleModel } from 'src/app/shared/models/role';

export interface AddReportModel {
    name: string;
    role: RoleModel[];
    format: ReportFormatModel;
    description?: string;
    xsltData: string;
    xsltName: string;
}

export interface AddReportOptionsModel {
    roles: RoleModel[];
    formats: ReportFormatModel[];
}

export interface ReportFormatModel {
    id: number;
    format: string;
}

export interface UploadFileModel {
    fileData: string;
    fileName: string;
}

export const initialAddReportOptions: AddReportOptionsModel = {
    roles: [],
    formats: [
        {
            id: 1,
            format: 'XML',
        },
    ],
};
