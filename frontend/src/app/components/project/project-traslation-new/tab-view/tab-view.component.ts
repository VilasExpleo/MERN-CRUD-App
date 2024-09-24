import { Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { TabService } from 'src/app/core/services/project/project-translation/tab.service';
import { CountResponseModel } from 'src/app/shared/models/tabs/count-response.model';

@Component({
    selector: 'app-tab-view',
    templateUrl: './tab-view.component.html',
})
export class TabViewComponent implements OnInit {
    tabIndex = 0;
    commentCount$;
    referencesCount$;

    constructor(private tabService: TabService) {}

    ngOnInit(): void {
        this.commentCount$ = this.tabService.getCountCommentState().pipe(map((state: number) => state));
        this.referencesCount$ = this.tabService
            .getCountState()
            .pipe(map((state: CountResponseModel) => state.references));
    }

    handleTabViewChange(event) {
        this.tabIndex = event.index;
        this.tabService.setState(event.index);
    }
}
