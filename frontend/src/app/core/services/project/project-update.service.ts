import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProjectModel } from 'src/app/shared/models/project/project';

@Injectable({
    providedIn: 'root',
})
export class ProjectUpdateService {
    private project = new BehaviorSubject<ProjectModel[]>(null);
    project$ = this.project.asObservable();

    setProjectState(project: ProjectModel[]) {
        this.project.next(project);
    }

    getProjectState(): Observable<ProjectModel[]> {
        return this.project$;
    }
}
