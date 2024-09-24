import { Component, ViewChild } from '@angular/core';
import { ResponseStatusEnum } from 'src/Enumerations';
import { HelpCreatorService } from 'src/app/core/services/help-creator/help-creator.service';
import { HelpCreatorUpdatePageModel } from 'src/app/shared/models/help-creator/help-creator-request.model';
import { HelpCenterPagePropertyModel } from 'src/app/shared/models/help-creator/help-creator-response.model';
import { HelpCreatorDashboardPageModel } from './help-creator-dashboard.model';
import { HelpIndexComponent } from './help-index/help-index.component';
import { HelpPageComponent } from './help-page/help-page.component';

@Component({
    selector: 'app-help-creator-dashboard',
    templateUrl: './help-creator-dashboard.component.html',
})
export class HelpCreatorDashboardComponent {
    page: HelpCreatorDashboardPageModel;
    isPageEditable = false;

    @ViewChild('helpPage') helpPage: HelpPageComponent;
    @ViewChild('helpIndex') helpIndex: HelpIndexComponent;

    constructor(private readonly helpCreatorService: HelpCreatorService) {}

    onPageSelect(page: HelpCenterPagePropertyModel): void {
        this.helpCreatorService.getPage(page).subscribe((response) => {
            this.page = response;
        });
    }

    onEditPage(value: boolean): void {
        this.isPageEditable = value;
        if (!value) {
            this.helpPage.helpPageForm.get('formattedContent').markAsUntouched();
        }
    }

    onUpdatePage(pageProperty: HelpCenterPagePropertyModel) {
        const page: HelpCreatorUpdatePageModel = {
            pageId: pageProperty.pageId,
            pageTitle: pageProperty.pageTitle,
            parentPageId: pageProperty.parentPageId,
        };
        this.page.pageTitle = page.pageTitle;
        this.onSavePage(page);
    }

    onSavePage(value: HelpCreatorUpdatePageModel): void {
        this.helpCreatorService.updatePage(value).subscribe((response) => {
            if (response.status === ResponseStatusEnum.OK) {
                this.helpCreatorService.showToastMessage('success', 'Success', 'Page updated successfully');
                this.helpIndex.properties['isEditMode'] = false;
                this.helpIndex.editPageEvent.emit(false);
            }
        });
    }
}
