import { createSpyFromClass, Spy } from 'jest-auto-spies';
import { ProjectHelpService } from './project-help.service';
import { ApiService } from '../../api.service';
import { HelpCreatorService } from '../../help-creator/help-creator.service';
import { UserService } from '../../user/user.service';
import { of } from 'rxjs';
import { BookmarksTransformer } from 'src/app/components/project-help/project-help-index/bookmarks/bookmarks.transformer';
import { ProjectHelpSearchTransformer } from 'src/app/components/project-help/project-help-index/project-help-search/project-help-search.transformer';
import { ProjectHelpIndexTransformer } from 'src/app/components/project-help/project-help-index/project-help-index.transformer';

describe('ProjectHelpService', () => {
    let service: ProjectHelpService;
    let apiServiceMock: Spy<ApiService>;
    let helpCreatorServiceMock: Spy<HelpCreatorService>;
    let mockProjectHelpSearchTransformer: Spy<ProjectHelpSearchTransformer>;
    let bookmarksTransformerMock: Spy<BookmarksTransformer>;
    let mockProjectHelpIndexTransformer: Spy<ProjectHelpIndexTransformer>;
    let userServiceMock: Spy<UserService>;

    beforeEach(() => {
        apiServiceMock = createSpyFromClass(ApiService);
        helpCreatorServiceMock = createSpyFromClass(HelpCreatorService);
        userServiceMock = createSpyFromClass(UserService);
        bookmarksTransformerMock = createSpyFromClass(BookmarksTransformer);
        mockProjectHelpSearchTransformer = createSpyFromClass(ProjectHelpSearchTransformer);
        mockProjectHelpIndexTransformer = createSpyFromClass(ProjectHelpIndexTransformer);

        userServiceMock.getUser.mockReturnValue(1);

        service = new ProjectHelpService(
            apiServiceMock,
            helpCreatorServiceMock,
            mockProjectHelpSearchTransformer,
            bookmarksTransformerMock,
            mockProjectHelpIndexTransformer,
            userServiceMock
        );
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get page context', () => {
        const linkName = 'example';
        const response = { data: {} };
        apiServiceMock.getRequest.mockReturnValue(of(response));

        service.getPageContext(linkName).subscribe((data) => {
            expect(data).toEqual(response.data);
        });

        expect(apiServiceMock.getRequest).toHaveBeenCalledWith(`help/page-context/${linkName}`);
    });

    it('should set and get page state', () => {
        const page = { data: { id: 1, parentPageId: 1, pageId: 1, pageTitle: 'Help System' } };
        service.setPageState(page);
        service.getPageState().subscribe((data) => {
            expect(data).toEqual(page);
        });
    });

    it('should set and get search texts', () => {
        const text = 'mock-text';
        service.setSearchText(text);
        service.getSearchText().subscribe((value) => {
            expect(value).toBe(text);
        });
    });

    it('should set and get selected Tabs', () => {
        const tab = 2;
        service.setSelectedTab(tab);
        service.getSelectedTab().subscribe((value) => {
            expect(value).toBe(tab);
        });
    });

    it('should call filtered pages when page is searched', () => {
        const mockSearchPage = {
            pageTitle: 'mock page',
            pageId: 1,
        };
        const mockResponse = {
            data: [mockSearchPage],
        };
        service.setSearchText('mock-search-text');
        apiServiceMock.getRequest.mockReturnValue(of(mockResponse));
        mockProjectHelpSearchTransformer.transform.mockReturnValue(of(mockSearchPage));
        service.getFilteredPage().subscribe((response) => {
            expect(response).toEqual(mockSearchPage);
        });
    });

    it('should get selected page properties', () => {
        const page = { data: { id: 1, parentPageId: 1, pageId: 1, pageTitle: 'Help System' } };
        const dashboardData = {
            id: 1,
            pageId: 1,
            parentPageId: 1,
            pageTitle: 'Help System',
            isBookmark: true,
            userId: 1,
        };
        helpCreatorServiceMock.getPage.mockReturnValue(of(dashboardData));

        service.getSelectedPageProperties().subscribe((data) => {
            expect(data).toEqual(dashboardData);
        });

        service.setPageState(page);

        expect(helpCreatorServiceMock.getPage).toHaveBeenCalledWith(page.data);
    });

    it('should reset state', () => {
        service.resetState();
        service.getPageState().subscribe((data) => {
            expect(data).toBeNull();
        });
    });

    it('should get bookmark pages', () => {
        const bookmarkResponse = { data: [] };
        const transformedData = {
            pageId: 1,
            pageTitle: 'Help Page',
        };
        apiServiceMock.getRequest.mockReturnValue(of(bookmarkResponse));
        bookmarksTransformerMock.transform.mockReturnValue(transformedData);

        service.getBookmarkPages().subscribe((data) => {
            expect(data).toEqual(transformedData);
        });

        expect(apiServiceMock.getRequest).toHaveBeenCalledWith(`help/bookmark/${userServiceMock.getUser().id}`);
        expect(bookmarksTransformerMock.transform).toHaveBeenCalledWith(bookmarkResponse.data);
    });

    it('should bookmark a page', () => {
        const bookmarkedPage = {
            userId: 1,
            helpPageId: 1,
            isBookmark: true,
        };
        const response = {
            pageId: 1,
            pageTitle: 'Help Page',
        };
        apiServiceMock.postTypeRequest.mockReturnValue(of(response));

        service.bookmarkPage(bookmarkedPage).subscribe((data) => {
            expect(data).toEqual(response);
        });

        expect(apiServiceMock.postTypeRequest).toHaveBeenCalledWith('help/bookmark', bookmarkedPage);
    });
});
