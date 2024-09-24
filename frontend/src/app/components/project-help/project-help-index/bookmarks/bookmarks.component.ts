import { UserService } from './../../../../core/services/user/user.service';
import { MessageService } from 'primeng/api';
import { ResponseStatusEnum } from './../../../../../Enumerations';
import { catchError, of, takeUntil, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectHelpService } from 'src/app/core/services/project/project-help/project-help.service';
import { BookmarksModel } from './bookmarks.model';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { BookmarksRequestModel } from 'src/app/shared/models/project-help/bookmarks-request.model';
import { NgEventBus } from 'ng-event-bus';

@Component({
    selector: 'app-bookmarks',
    templateUrl: './bookmarks.component.html',
})
export class BookmarksComponent implements OnInit, OnDestroy {
    private userId: number;
    bookmarkPages: BookmarksModel[];
    selectedPage: BookmarksModel;
    destroyed$ = new Subject<boolean>();

    constructor(
        private projectHelpService: ProjectHelpService,
        private messageService: MessageService,
        private userService: UserService,
        private eventBus: NgEventBus
    ) {
        this.userId = this.userService.getUser().id;
    }

    ngOnInit(): void {
        this.getBookmarkPages();
        this.eventBus
            .on('projectHelp:bookmark')
            .pipe(takeUntil(this.destroyed$))
            .subscribe(() => {
                this.getBookmarkPages();
            });
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
    }

    private getBookmarkPages() {
        this.projectHelpService.getBookmarkPages().subscribe((response: BookmarksModel[]) => {
            this.bookmarkPages = response ?? [];
        });
    }

    deleteBookmarkPage(pageId: number) {
        this.projectHelpService
            .bookmarkPage(this.getPayloadToDeleteBookmarkedPage(pageId))
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response: ApiBaseResponseModel) => {
                    if (response?.status === ResponseStatusEnum.OK) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Successfully removed bookmark',
                        });

                        this.bookmarkPages = this.bookmarkPages.filter((page) => page?.pageId !== pageId);
                    }
                },
            });
    }

    private getPayloadToDeleteBookmarkedPage(pageId: number): BookmarksRequestModel {
        return {
            userId: this.userId,
            helpPageId: pageId,
            isBookmark: false,
        };
    }

    onRowSelect(value: BookmarksModel) {
        const payload = {
            data: {
                ...value,
                id: 0,
                parentPageId: 0,
            },
        };
        this.projectHelpService.setPageState(payload);
    }
}
