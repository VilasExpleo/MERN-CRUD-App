import { DatePipe } from '@angular/common';
import { UserService } from 'src/app/core/services/user/user.service';
import { Injectable } from '@angular/core';
import { ProjectCommentRequestModel } from 'src/app/shared/models/delete-comments/project-comment-request.model';

@Injectable({
    providedIn: 'root',
})
export class TableOperationService {
    filter: any = [];

    constructor(private user: UserService, private datePipe: DatePipe) {}

    processFilter(event, projectId: number) {
        const user = this.user.getUser();
        const requestPayload: ProjectCommentRequestModel = {
            userId: user.id,
            projectId: projectId,
            size: 10,
            offset: event.first,
        };

        const filterObject = event?.filters;
        if (filterObject) {
            const entries = Object.entries(filterObject);
            this.filter = [];
            entries.forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    value.forEach((item) => {
                        if (item.value !== null) {
                            const filterAttributes = {
                                operator: item.operator,
                                columnName: key,
                                value: key.includes('date')
                                    ? this.datePipe.transform(item.value, 'yyyy-MM-dd')
                                    : item.value,
                                condition: item.matchMode,
                            };
                            this.filter.push(filterAttributes);
                        }
                    });
                }
            });
            if (this.filter.length) {
                requestPayload['filter'] = this.filter;
            }
        }

        if (event?.sortField) {
            const sortOrder = event.sortOrder === -1 ? 'desc' : 'asc';
            requestPayload['sort'] = { columnName: event.sortField, order: sortOrder };
        }
        return requestPayload;
    }
}
