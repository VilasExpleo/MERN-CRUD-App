import { Injectable } from '@angular/core';
import TranslatorDashboardModel from './translator-dashboard.model';

@Injectable({
    providedIn: 'root',
})
export class TranslatorDashboardTransformer {
    transform(response): TranslatorDashboardModel {
        return {
            projects: this.updateProjectWithDateAndVersion(response.data),
        };
    }
    private updateProjectWithDateAndVersion(projects) {
        return projects.map((project) => {
            const dueDate = new Date(project.due_date);
            const remainingTime = dueDate.getTime() - new Date().getTime();

            return {
                ...project,
                remainingTime: Math.ceil(remainingTime / (1000 * 60 * 60 * 24)),
                brand_name: project.brand_name.trim(),
                version_id_show: this.getVersion(project.version_id),
                proofread: project.proofread ? 'Yes' : 'No',
            };
        });
    }

    private getVersion = (versionId: number) => {
        return +versionId.toString().split('.')[1];
    };
}
