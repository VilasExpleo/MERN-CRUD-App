import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, catchError, combineLatest, map, of, take, takeUntil } from 'rxjs';
import { LabelModel } from 'src/app/components/dashboard/label-manager/label.model';
import { LabelTransformer } from 'src/app/components/dashboard/label-manager/label.transformer';
import { ApiService } from '../api.service';
import { LabelAssignType, Roles } from 'src/Enumerations';
import { UserService } from '../user/user.service';
import { CreateLabelRequestModel } from 'src/app/shared/models/labels/create-label-request.model';
import { LabelIcons } from 'src/app/components/dashboard/label-manager/label-icons';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { LabelFilterTransformer } from 'src/app/components/project/project-traslation-new/table-view/label-filter/label-filter.transformer';
import { DialogService } from 'primeng/dynamicdialog';
import { AssignLabelConfigModel } from 'src/app/shared/components/assign-label/assign-label-config.model';
import { LabelAssignRequestModel } from 'src/app/shared/models/labels/label-assign-request.model';
import { TreeNode } from 'primeng/api';
import { AssignLabelComponent } from 'src/app/shared/components/assign-label/assign-label.component';
import { LabelOperations } from 'src/app/shared/models/labels/label-operations.model';
import { SourceLabelRequestModel } from 'src/app/shared/models/labels/source-label-request-model';

@Injectable({
    providedIn: 'root',
})
export class LabelsService {
    private selectedLabel = new BehaviorSubject<LabelModel>(null);
    selectedLabel$ = this.selectedLabel.asObservable();

    private endSubject$ = new Subject<boolean>();

    constructor(
        private labelTransformer: LabelTransformer,
        private apiService: ApiService,
        private userService: UserService,
        private labelFilterTransformer: LabelFilterTransformer,
        private dialogService: DialogService
    ) {}

    getLabels(projectId: number): Observable<LabelModel[]> {
        return this.apiService.getRequest(`api/projects/${projectId}/labels`).pipe(
            catchError(() => of({ data: [] })),
            map((response) => this.labelTransformer.transform(response['data']))
        );
    }

    createLabels(projectId: number, label: CreateLabelRequestModel): Observable<ApiBaseResponseModel> {
        const payload = this.getPayloadForCreateLabels(label);
        return this.apiService
            .postTypeRequestTyped(`api/projects/${projectId}/labels`, payload)
            .pipe(catchError(() => of(undefined)));
    }

    updateLabel(projectId: number, labelId: number, label: CreateLabelRequestModel): Observable<ApiBaseResponseModel> {
        const payload = this.getPayloadForCreateLabels(label);
        return this.apiService
            .putTypeRequest(`api/projects/${projectId}/labels/${labelId}`, payload)
            .pipe(catchError(() => of(undefined)));
    }

    deleteLabel(labelId: number, projectId: number): Observable<ApiBaseResponseModel> {
        return this.apiService
            .deleteTypeRequest(`api/projects/${projectId}/labels/${labelId}`, {
                role: this.getRole(),
            })
            .pipe(catchError(() => of(undefined)));
    }

    getAttachTo(): Observable<string[]> {
        return this.apiService.getRequest('api/label-attach-to').pipe(
            catchError(() => of({ data: [] })),
            map((response: ApiBaseResponseModel) => response?.data)
        );
    }

    getRestriction(): Observable<string[]> {
        return this.apiService.getRequest('api/label-restriction').pipe(
            catchError(() => of({ data: [] })),
            map((response: ApiBaseResponseModel) => response?.data)
        );
    }

    getIcons(): Observable<string[]> {
        return of(LabelIcons);
    }

    getFormOptions() {
        const attachTo$ = this.getAttachTo();
        const restrictions$ = this.getRestriction();
        const icons$ = this.getIcons();

        return combineLatest([attachTo$, restrictions$, icons$]).pipe(
            take(1),
            map(([attachTo, restrictions, icons]) => {
                return {
                    attachTo,
                    restrictions,
                    icons,
                };
            })
        );
    }

    setSelectedLabel(value: LabelModel): void {
        this.selectedLabel.next(value);
    }

    getSelectedLabel(): Observable<LabelModel> {
        return this.selectedLabel$.pipe(takeUntil(this.endSubject$));
    }

    resetState(): void {
        this.endSubject$.next(true);
        this.setSelectedLabel(null);
    }

    private getPayloadForCreateLabels(label: CreateLabelRequestModel): CreateLabelRequestModel {
        return {
            ...label,
            role: this.getRole(),
        };
    }

    getSourceLabels(SourceLabelRequestModel: SourceLabelRequestModel): Observable<LabelOperations[]> {
        return this.apiService
            .getRequest(
                `api/projects/${SourceLabelRequestModel.projectId}/labels/types/${SourceLabelRequestModel.type}`
            )
            .pipe(
                catchError(() => of([])),
                map((response) => this.labelFilterTransformer.transform(response['data']))
            );
    }

    assignLabel(
        selectedRow: any,
        source: string,
        projectId: number,
        selectedTableColumnLanguage?: string,
        editorLangForDone?: string
    ): void {
        this.dialogService.open(
            AssignLabelComponent,
            this.getDialogDefaultConfig(selectedRow, source, projectId, selectedTableColumnLanguage, editorLangForDone)
        );
    }

    private getDialogDefaultConfig(
        selectedRow: any,
        source: string,
        projectId: number,
        selectedTableColumnLanguage?: string,
        editorLangForDone?: string
    ) {
        return {
            footer: ' ',
            modal: true,
            closable: true,
            autoZIndex: true,
            maximizable: false,
            width: '70vw',
            minX: 10,
            minY: 10,
            draggable: true,
            data: this.getAssignLabelConfig(
                selectedRow,
                source,
                projectId,
                selectedTableColumnLanguage,
                editorLangForDone
            ),
            header: 'Assign Label',
        };
    }

    private getAssignLabelConfig(
        selectedRow: any,
        source: string,
        projectId: number,
        selectedTableColumnLanguage?: string,
        editorLangForDone?: string
    ): AssignLabelConfigModel {
        return {
            translationSelectedRow: selectedRow,
            translationSource: source,
            projectId: projectId,
            selectedTableColumnLanguage,
            editorLangForDone,
        };
    }

    assignLabelToNode(labelAssignRequestModel: LabelAssignRequestModel, projectId: number) {
        return this.apiService.postTypeRequest(`api/projects/${projectId}/set-labels`, labelAssignRequestModel);
    }

    isLabelMenuVisible(treeNode: TreeNode, role: string): boolean {
        return treeNode.data?.Type !== LabelAssignType.Project && Roles[role] === Roles.editor;
    }

    private getRole(): string {
        return Roles[this.userService.getUser().role];
    }
}
