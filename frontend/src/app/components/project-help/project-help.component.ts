import { ResponseStatusEnum } from './../../../Enumerations';
import { ApiBaseResponseModel } from './../../shared/models/api-base-response.model';
import { catchError, of } from 'rxjs';
import { UserService } from './../../core/services/user/user.service';
import { BookmarksRequestModel } from '../../shared/models/project-help/bookmarks-request.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectHelpService } from '../../core/services/project/project-help/project-help.service';
import { ProjectHelpPagePropertyModel } from './project-help-index/project-help-index.model';
import { MessageService } from 'primeng/api';
import { NgEventBus } from 'ng-event-bus';

@Component({
    selector: 'app-project-help',
    templateUrl: './project-help.component.html',
})
export class ProjectHelpComponent implements OnInit, OnDestroy {
    private userId: number;
    pageContext = '';
    isBookMarked = false;
    title = '';
    helpPageId: number;

    constructor(
        private readonly route: ActivatedRoute,
        private projectHelpService: ProjectHelpService,
        private userService: UserService,
        private messageService: MessageService,
        private eventBus: NgEventBus
    ) {
        this.userId = this.userService.getUser()?.id;
    }

    ngOnInit(): void {
        this.pageContext = this.route.snapshot.data['pageContext']?.formattedContent;
        this.title = this.route.snapshot.data['pageContext']?.pageTitle;
        this.getSelectedPageProperties();
        this.resetContentOnSearch();
    }

    ngOnDestroy(): void {
        this.projectHelpService.resetState();
    }

    saveOrRemoveBookmarkPage() {
        this.projectHelpService
            .bookmarkPage(this.getBookmarkPagePayload())
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response: ApiBaseResponseModel) => {
                    if (response?.status === ResponseStatusEnum.OK) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: this.isBookMarked ? 'Successfully bookmarked' : 'Successfully removed bookmark',
                        });
                    }
                    this.eventBus.cast('projectHelp:bookmark', {});
                },
            });
    }

    private getBookmarkPagePayload(): BookmarksRequestModel {
        return {
            userId: this.userId,
            helpPageId: this.helpPageId,
            isBookmark: (this.isBookMarked = !this.isBookMarked),
        };
    }

    private getSelectedPageProperties() {
        this.projectHelpService.getSelectedPageProperties().subscribe((response: ProjectHelpPagePropertyModel) => {
            this.pageContext = response?.formattedContent ?? '';
            this.title = response?.pageTitle;
            this.isBookMarked = response?.isBookmark;
            this.helpPageId = response?.pageId;
        });
    }

    private resetContentOnSearch() {
        this.projectHelpService.getSearchText().subscribe((text) => {
            text && (this.pageContext = '');
        });
    }
}
