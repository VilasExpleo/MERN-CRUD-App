import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, catchError, combineLatest, map, of, take } from 'rxjs';
import { HelpCreatorDashboardPageModel } from 'src/app/components/dashboard/help-creator-dashboard/help-creator-dashboard.model';
import { HelpCreatorDashboardTransformer } from 'src/app/components/dashboard/help-creator-dashboard/help-creator-dashboard.transformer';
import { HelpIndexModel } from 'src/app/components/dashboard/help-creator-dashboard/help-index/help-index.model';
import { HelpIndexTransformer } from 'src/app/components/dashboard/help-creator-dashboard/help-index/help-index.transformer';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import {
    HelpCreatorRequestModel,
    HelpCreatorTemplateModel,
    HelpCreatorUpdatePageModel,
} from 'src/app/shared/models/help-creator/help-creator-request.model';
import {
    HelpCenterPagePropertyModel,
    HelpCreatorLinksModel,
    HelpTemplateOptionModel,
    HelpTemplateResponseModel,
} from 'src/app/shared/models/help-creator/help-creator-response.model';
import { ApiService } from '../api.service';
import { UserService } from '../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class HelpCreatorService {
    constructor(
        private readonly userService: UserService,
        private readonly apiService: ApiService,
        private readonly helpCreatorDashboardTransformer: HelpCreatorDashboardTransformer,
        private readonly messageService: MessageService,
        private readonly helpIndexTransformer: HelpIndexTransformer
    ) {}

    get userId(): number {
        return this.userService.getUser().id;
    }

    getHelpSystemPages(): Observable<HelpIndexModel[]> {
        return this.apiService.getRequest(`help-system/structure/${this.userId}`).pipe(
            catchError(() => of({ data: [] })),
            map((response: ApiBaseResponseModel) => this.helpIndexTransformer.transform(response.data))
        );
    }

    addPage(row: HelpCenterPagePropertyModel): Observable<ApiBaseResponseModel> {
        const payload = this.getPayload(row);
        return this.apiService.postTypeRequest('help-system/page', payload).pipe(catchError(() => of(undefined)));
    }

    updatePage(page: HelpCreatorUpdatePageModel): Observable<ApiBaseResponseModel> {
        const payload = this.getUpdatePayload(page);
        return this.apiService
            .patchTypeRequest(`help-system/page/${page.pageId}/${this.userId}`, payload)
            .pipe(catchError(() => of(undefined)));
    }

    deletePage(pageId: number, isSubPagesKept: boolean): Observable<ApiBaseResponseModel> {
        return this.apiService.deleteRequest(`help-system/page/${pageId}/${isSubPagesKept}`);
    }

    getPage(page: HelpCenterPagePropertyModel): Observable<HelpCreatorDashboardPageModel> {
        return this.apiService.getRequest<ApiBaseResponseModel>(`help/page/${page?.pageId}/${this.userId}`).pipe(
            catchError(() => of({ data: {} })),
            map((response) => this.helpCreatorDashboardTransformer.transform(page, response['data']))
        );
    }

    getOptions(): Observable<HelpTemplateOptionModel> {
        const links$ = this.getLinks();
        const templates$ = this.getTemplates();
        return combineLatest([links$, templates$]).pipe(
            take(1),
            map(([links, templates]) => {
                return {
                    links,
                    templates,
                };
            })
        );
    }

    getTemplateContent(templateId: number): Observable<HelpTemplateResponseModel> {
        return this.apiService.getRequest(`help-system/template/${templateId}`).pipe(
            catchError(() => of({ data: {} })),
            map((response) => response['data'])
        );
    }

    addTemplate(template: HelpCreatorTemplateModel): Observable<HelpTemplateResponseModel> {
        return this.apiService.postTypeRequest('help-system/template', template).pipe(
            catchError(() => of({ data: {} })),
            map((response) => response['data'])
        );
    }

    updateTemplate(template: HelpCreatorTemplateModel, templateId: number): Observable<HelpTemplateResponseModel> {
        return this.apiService.patchTypeRequest(`help-system/template/${templateId}`, template).pipe(
            catchError(() => of({ data: {} })),
            map((response) => response['data'])
        );
    }

    deleteTemplate(templateId: number): Observable<ApiBaseResponseModel> {
        return this.apiService.deleteRequest(`help-system/template/${templateId}`);
    }

    showToastMessage(severity: string, summary: string, detail: string): void {
        this.messageService.add({
            severity,
            summary,
            detail,
        });
    }

    private getLinks(): Observable<HelpCreatorLinksModel[]> {
        return this.apiService.getRequest('help-system/links').pipe(
            catchError(() => of({ data: [] })),
            map((response) => response['data'])
        );
    }

    private getTemplates(): Observable<HelpTemplateResponseModel[]> {
        return this.apiService.getRequest('help-system/template').pipe(
            catchError(() => of({ data: [] })),
            map((response) => response['data'])
        );
    }

    private getPayload(row: HelpCenterPagePropertyModel): HelpCreatorRequestModel {
        return {
            pageTitle: row.pageTitle,
            parentPageId: row.parentPageId,
            userId: this.userId,
            formattedContent: '',
            tags: [],
            links: [],
        };
    }

    private getUpdatePayload(page: HelpCreatorUpdatePageModel): HelpCreatorUpdatePageModel {
        return {
            pageTitle: page.pageTitle,
            parentPageId: page.parentPageId,
            userId: this.userId,
            links: page.links,
            formattedContent: page.formattedContent,
            tags: page.tags,
        };
    }
}
