import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, switchMap } from 'rxjs';
import { DeleteResourceRequestModel } from 'src/app/shared/models/resource/delete-resource-file-request.model';
import { UploadRequestModel } from 'src/app/shared/models/resource/resource-file-upload-request.model';
import { ApiService } from '../api.service';
import { ResourceModel } from 'src/app/components/project/components/resources/screenshots/screenshots.model';

@Injectable({
    providedIn: 'root',
})
export class ResourceService {
    constructor(private apiService: ApiService) {}

    private resourceState = new BehaviorSubject<any>(null);
    public resourceState$ = this.resourceState.asObservable();

    private deleteResourceState = new BehaviorSubject<boolean>(false);
    private deleteResourceState$ = this.deleteResourceState.asObservable();

    setResourceState(val: ResourceModel) {
        this.resourceState.next(val);
    }

    getResourceState(): Observable<ResourceModel> {
        return this.resourceState$;
    }

    setDeleteResourceState(value: boolean): void {
        this.deleteResourceState.next(value);
    }

    getDeleteResourceState(): Observable<boolean> {
        return this.deleteResourceState$;
    }

    uploadFile(url: string, uploadRequestModel: UploadRequestModel) {
        const formData = new FormData();
        formData.append('file', uploadRequestModel.file);
        formData.append('userRole', uploadRequestModel.userRole);
        return this.apiService.postTypeRequest(url, formData).pipe(catchError(() => of(undefined)));
    }

    downloadScreenshotReport(projectId: number) {
        const url = `screenshot/project/${projectId}/screenshot-report`;
        return this.apiService.getRequest(url).pipe(
            catchError(() => of(undefined)),
            switchMap((response) => {
                if (!response) {
                    return of(undefined);
                }
                const fileName = response?.['fileName'].split('/')[response?.['fileName'].split('/').length - 1];
                const key = response?.['fileName'];
                const downloadUrl = `common/download?fileKey=${key}`;

                return this.handleDownloadRequest(downloadUrl, fileName);
            })
        );
    }

    private handleDownloadRequest(downloadUrl: string, fileName: string): Observable<any> {
        return this.apiService.downloadRequest(downloadUrl).pipe(
            catchError(() => of(undefined)),
            map((downloadResponse) => ({
                downloadResponse,
                fileName,
            }))
        );
    }

    deleteResource(url: string, deleteResourcePayload: DeleteResourceRequestModel) {
        return this.apiService.deleteTypeRequest(url, deleteResourcePayload);
    }

    abortFileUpload(url: string, uploadRequestModel: UploadRequestModel) {
        const formData = new FormData();
        formData.append('file', uploadRequestModel.file);
        formData.append('userRole', uploadRequestModel.userRole);
        return this.apiService.abortUploadPostTypeRequest(url, formData).pipe(catchError(() => of(undefined)));
    }
}
