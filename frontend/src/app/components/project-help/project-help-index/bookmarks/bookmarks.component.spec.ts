import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookmarksComponent } from './bookmarks.component';
import { of } from 'rxjs';
import { ResponseStatusEnum } from './../../../../../Enumerations';
import { ProjectHelpService } from 'src/app/core/services/project/project-help/project-help.service';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/core/services/user/user.service';
import { NgEventBus } from 'ng-event-bus';
import { createSpyFromClass, Spy } from 'jest-auto-spies';

describe('BookmarksComponent', () => {
    let component: BookmarksComponent;
    let fixture: ComponentFixture<BookmarksComponent>;
    let mockProjectHelpService: Spy<ProjectHelpService>;
    let mockMessageService: Spy<MessageService>;
    let mockUserService: Spy<UserService>;
    let mockEventBus: Spy<NgEventBus>;

    beforeEach(() => {
        mockProjectHelpService = createSpyFromClass(ProjectHelpService);

        mockMessageService = createSpyFromClass(MessageService);

        mockUserService = createSpyFromClass(UserService);
        mockUserService.getUser.mockReturnValue({ id: 1 });

        mockEventBus = createSpyFromClass(NgEventBus);
        mockEventBus.on.mockReturnValue(of({ data: 1 }));

        TestBed.configureTestingModule({
            declarations: [BookmarksComponent],
            providers: [
                { provide: ProjectHelpService, useValue: mockProjectHelpService },
                { provide: MessageService, useValue: mockMessageService },
                { provide: UserService, useValue: mockUserService },
                { provide: NgEventBus, useValue: mockEventBus },
            ],
        });

        fixture = TestBed.createComponent(BookmarksComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getBookmarkPages method on init', () => {
        mockProjectHelpService.getBookmarkPages.mockReturnValue(of([]));
        component.ngOnInit();
        expect(mockProjectHelpService.getBookmarkPages).toHaveBeenCalled();
    });

    it('should call deleteBookmarkPage method and update bookmarkPages on successful deletion', () => {
        const pageId = 1;
        const mockResponse = {
            status: ResponseStatusEnum.OK,
            message: 'Successfully removed bookmark',
        };
        const bookmarkPages = [{ pageId: 1, pageTitle: 'Help System' }];
        component.bookmarkPages = bookmarkPages;
        mockProjectHelpService.bookmarkPage.mockReturnValue(of(mockResponse));

        component.deleteBookmarkPage(pageId);

        expect(mockProjectHelpService.bookmarkPage).toHaveBeenCalledWith(
            expect.objectContaining({ userId: 1, helpPageId: pageId, isBookmark: false })
        );
        expect(mockMessageService.add).toHaveBeenCalledWith({
            severity: 'success',
            summary: 'Success',
            detail: mockResponse.message,
        });
        expect(component.bookmarkPages).toEqual([]);
    });

    it('should call onRowSelect method and setPageState', () => {
        const value = { pageId: 1, pageTitle: 'Help System' };

        const setPageStateSpy = jest.spyOn(mockProjectHelpService, 'setPageState');

        component.onRowSelect(value);

        expect(setPageStateSpy).toHaveBeenCalledWith({
            data: {
                ...value,
                id: 0,
                parentPageId: 0,
            },
        });
    });

    it('should unsubscribe onDestroy', () => {
        jest.spyOn(component.destroyed$, 'next');
        component.ngOnDestroy();
        expect(component.destroyed$.next).toHaveBeenCalledWith(true);
    });
});
