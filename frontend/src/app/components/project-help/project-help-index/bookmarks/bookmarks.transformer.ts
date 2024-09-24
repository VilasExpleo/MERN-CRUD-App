import { Injectable } from '@angular/core';
import { BookmarksResponseModel } from 'src/app/shared/models/project-help/bookmarks-response.model';
import { BookmarksModel } from './bookmarks.model';

@Injectable({
    providedIn: 'root',
})
export class BookmarksTransformer {
    transform(response: BookmarksResponseModel[]): BookmarksModel[] {
        return response?.map((page: BookmarksModel) => ({
            pageId: page.pageId,
            pageTitle: page.pageTitle,
        }));
    }
}
