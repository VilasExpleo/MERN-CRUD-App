import { map } from 'rxjs/operators';
import { ApiService } from './../api.service';
import { Injectable } from '@angular/core';
import { DeleteCommentsTransformer } from 'src/app/components/dashboard/delete-comments/delete-comments-transformer';
import { ProjectCommentRequestModel } from 'src/app/shared/models/delete-comments/project-comment-request.model';
import { DeleteCommentsRequestModel } from 'src/app/shared/models/delete-comments/delete-comments-request.model';

@Injectable({
    providedIn: 'root',
})
export class DeleteCommentsService {
    constructor(private api: ApiService, private deleteCommentsTransformer: DeleteCommentsTransformer) {}
    getCommentsData(request: ProjectCommentRequestModel) {
        return this.api
            .postTypeRequest('comments/get-list', request)
            .pipe(map((response) => this.deleteCommentsTransformer.transform(response?.['data'])));
    }

    deleteCommentsData(deleteCommentRequest: DeleteCommentsRequestModel) {
        return this.api.postTypeRequest('comments/multiple-delete', deleteCommentRequest);
    }
}
