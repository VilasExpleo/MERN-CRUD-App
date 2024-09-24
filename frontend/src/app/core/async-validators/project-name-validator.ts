import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProjectFlow } from 'src/app/components/project/components/properties/editable-properties.enum';
import { ProjectFlowType } from 'src/app/components/project/components/properties/editable-properties.model';
import { ProjectService } from '../services/project/project.service';

export class ProjectnameValidator {
    static createValidator(
        projectService: ProjectService,
        projectName?: string,
        projectFlow?: ProjectFlowType
    ): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            if (projectFlow === ProjectFlow.properties && control.value === projectName) {
                return of(null);
            }

            return projectService.checkProjectName({ project_name: control.value }).pipe(
                map((result) => {
                    return result['status'] === 'NOK' ? { projectNameAlreadyExists: true } : null;
                })
            );
        };
    }
}
