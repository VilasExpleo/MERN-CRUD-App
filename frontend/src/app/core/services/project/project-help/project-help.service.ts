import { UserService } from './../../user/user.service';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    Subject,
    catchError,
    debounceTime,
    filter,
    map,
    of,
    switchMap,
    takeUntil,
} from 'rxjs';
import { HelpCreatorDashboardPageModel } from 'src/app/components/dashboard/help-creator-dashboard/help-creator-dashboard.model';
import { BookmarksModel } from 'src/app/components/project-help/project-help-index/bookmarks/bookmarks.model';
import { BookmarksTransformer } from 'src/app/components/project-help/project-help-index/bookmarks/bookmarks.transformer';
import { ProjectHelpIndexModel } from 'src/app/components/project-help/project-help-index/project-help-index.model';
import { ProjectHelpIndexTransformer } from 'src/app/components/project-help/project-help-index/project-help-index.transformer';
import { ProjectHelpSearchModel } from 'src/app/components/project-help/project-help-index/project-help-search/project-help-search.model';
import { ProjectHelpSearchTransformer } from 'src/app/components/project-help/project-help-index/project-help-search/project-help-search.transformer';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { BookmarksRequestModel } from 'src/app/shared/models/project-help/bookmarks-request.model';
import { ProjectHelpResponseModel } from 'src/app/shared/models/project-help/project-help-response.model';
import { ApiService } from '../../api.service';
import { HelpCreatorService } from '../../help-creator/help-creator.service';

@Injectable({
    providedIn: 'root',
})
export class ProjectHelpService {
    private userId: number;
    private pageState = new BehaviorSubject<ProjectHelpIndexModel>(null);
    pageState$ = this.pageState.asObservable();

    private endSubject$ = new Subject<boolean>();

    private textChange = new Subject<string>();
    textChange$ = this.textChange.asObservable();

    private tabChange = new Subject<number>();
    tabChange$ = this.tabChange.asObservable();

    constructor(
        private readonly apiService: ApiService,
        private readonly helpCreatorService: HelpCreatorService,
        private readonly projectHelpSearchTransformer: ProjectHelpSearchTransformer,
        private readonly bookmarkTransformer: BookmarksTransformer,
        private readonly projectHelpIndexTransformer: ProjectHelpIndexTransformer,
        private readonly userService: UserService
    ) {
        this.userId = this.userService.getUser().id;
    }

    getPageContext(linkName: string): Observable<ProjectHelpResponseModel> {
        return this.apiService.getRequest<ApiBaseResponseModel>(`help/page-context/${linkName}`).pipe(
            catchError(() => of({ data: null })),
            map((response) => response.data)
        );
    }
    getHelpPages(): Observable<ProjectHelpIndexModel[]> {
        return this.apiService.getRequest(`help/structure`).pipe(
            catchError(() => of({ data: [] })),
            map((response: ApiBaseResponseModel) => this.projectHelpIndexTransformer.transform(response.data))
        );
    }

    setPageState(page: ProjectHelpIndexModel): void {
        this.pageState.next(page);
    }

    getPageState(): Observable<ProjectHelpIndexModel> {
        return this.pageState$;
    }

    setSearchText(value: string): void {
        this.textChange.next(value);
    }

    getSearchText(): Observable<string> {
        return this.textChange$;
    }

    setSelectedTab(index: number): void {
        this.tabChange.next(index);
    }

    getSelectedTab(): Observable<number> {
        return this.tabChange$.pipe(takeUntil(this.endSubject$));
    }

    getSelectedPageProperties(): Observable<HelpCreatorDashboardPageModel> {
        return this.getPageState().pipe(
            takeUntil(this.endSubject$),
            filter((page) => !!page),
            switchMap((page: ProjectHelpIndexModel) => {
                const payload = {
                    ...page?.data,
                };
                return this.helpCreatorService.getPage(payload);
            })
        );
    }

    getFilteredPage(): Observable<ProjectHelpSearchModel[]> {
        return this.getSearchText().pipe(
            takeUntil(this.endSubject$),
            debounceTime(400),
            switchMap((text: string) => {
                if (!text) {
                    return of(this.projectHelpSearchTransformer.transform([]));
                }
                return this.apiService.getRequest<ApiBaseResponseModel>(`help/search?searchText=${text}`).pipe(
                    catchError(() => of({ data: [] })),
                    map((response) => this.projectHelpSearchTransformer.transform(response.data))
                );
            })
        );
    }

    resetState(): void {
        this.endSubject$.next(true);
    }

    getBookmarkPages(): Observable<BookmarksModel[]> {
        return this.apiService.getRequest(`help/bookmark/${this.userId}`).pipe(
            catchError(() => of({ data: [] })),
            map((response: ApiBaseResponseModel) => this.bookmarkTransformer.transform(response.data))
        );
    }

    bookmarkPage(bookmarkedPage: BookmarksRequestModel) {
        return this.apiService.postTypeRequest(`help/bookmark`, bookmarkedPage);
    }
}
