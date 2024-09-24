import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ConfirmEventType } from 'primeng/api';
import { ResponseStatusEnum } from 'src/Enumerations';
import { HelpCreatorService } from 'src/app/core/services/help-creator/help-creator.service';
import { HelpCenterPagePropertyModel } from 'src/app/shared/models/help-creator/help-creator-response.model';
import { Column, HelpIndexModel, HelpIndexNodeModel } from './help-index.model';
@Component({
    selector: 'app-help-index',
    templateUrl: './help-index.component.html',
})
export class HelpIndexComponent implements OnInit {
    pages: HelpIndexModel[] = [];
    cols: Column[] = [];
    selectedRow: HelpIndexModel;
    initialRow: HelpCenterPagePropertyModel;
    indexNode: HelpIndexNodeModel;
    properties: HelpCenterPagePropertyModel;
    isSubPagesKept = false;
    isParentHasChildren = false;

    @Output() selectedPageEvent = new EventEmitter<HelpCenterPagePropertyModel>();
    @Output() editPageEvent = new EventEmitter<boolean>();
    @Output() updatePageEvent = new EventEmitter<HelpCenterPagePropertyModel>();

    deleteConfirmationModel = {
        showConfirmation: false,
        confirmationHeader: 'Confirmation - Delete Page',
        confirmationMessage: 'Are you sure you want to delete this page?',
        acceptProperties: {
            icon: 'pi pi-check',
            class: 'p-button-danger',
            label: 'Yes',
        },
        rejectProperties: {
            icon: 'pi pi-times',
            label: 'No',
            class: 'p-button-outlined',
        },
        onAccept: () => {
            this.acceptDeletingPage();
        },
        onReject: (type: ConfirmEventType) => {
            switch (type) {
                case ConfirmEventType.CANCEL:
                    this.deleteConfirmationModel.showConfirmation = false;
                    break;
                case ConfirmEventType.REJECT:
                    this.rejectDeletingPage();
                    break;
            }
        },
    };

    constructor(
        private readonly helpCreatorService: HelpCreatorService,
        private readonly changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.cols = [{ field: 'pageTitle', header: 'Create Page' }];
        this.helpCreatorService.getHelpSystemPages().subscribe((response: HelpIndexModel[]) => {
            this.pages = response;
        });
    }

    startEdit(row: HelpCenterPagePropertyModel, rowIndexNode: HelpIndexNodeModel): void {
        this.selectedRow = rowIndexNode.node;
        row['isEditMode'] = true;
        this.properties = row;
        this.initialRow = { ...row };
        this.editPageEvent.emit(true);
        this.selectionChange();
    }

    savePage(row: HelpCenterPagePropertyModel): void {
        row.isSaved ? this.updatePage(row) : this.saveNewPage(row);
    }

    addPage(): void {
        const id = this.pages.length === 0 ? 1 : this.pages.slice(-1)[0].data.id + 1;
        this.selectedRow = this.getTemplateRow(id, 0, 0);
        this.pages = [...this.pages, this.selectedRow];
        this.changeDetectorRef.detectChanges();
        this.selectionChange();
    }

    addPageItem(row: HelpIndexNodeModel): void {
        row.node['expanded'] = true;
        const itemId = Number(`${this.pages.length + 1}${row.node.children.length + 1}`);
        this.selectedRow = this.getTemplateRow(itemId, 0, row.node.data.pageId, true);
        row.node.children = [...row.node.children, this.selectedRow];
        this.pages = [...this.pages];
        this.selectionChange();
    }

    cancelEdit(row: HelpIndexNodeModel, properties: HelpCenterPagePropertyModel): void {
        properties['isEditMode'] = false;
        this.editPageEvent.emit(false);
        this.properties = properties;
        this.delete(row, properties, !properties?.isSaved);
        if (this.selectedRow) {
            properties.pageTitle = this.initialRow?.pageTitle ?? '';
        }
    }

    selectionChange(): void {
        if (this.selectedRow) {
            this.selectedPageEvent.emit(this.selectedRow.data);
        }
    }

    deletePage(row: HelpIndexNodeModel, properties: HelpCenterPagePropertyModel): void {
        this.indexNode = { ...row };
        this.properties = properties;
        this.deleteConfirmationModel.showConfirmation = true;
        this.isParentHasChildren = row.node?.children?.length > 0;
        this.setConfirmationMessageAndProperties();
    }

    isPageExists(pageTitle: string): boolean {
        return this.pages.filter((page) => page.data?.pageTitle === pageTitle).length > 1;
    }

    private setConfirmationMessageAndProperties(): void {
        this.deleteConfirmationModel.acceptProperties = {
            icon: this.isParentHasChildren ? 'pi pi-times' : 'pi pi-check',
            class: 'p-button-danger',
            label: this.isParentHasChildren ? 'Delete All' : 'Yes',
        };
        this.deleteConfirmationModel.rejectProperties = {
            icon: this.isParentHasChildren ? 'pi pi-check' : 'pi pi-times',
            class: 'p-button-outlined',
            label: this.isParentHasChildren ? 'Keep Subpages' : 'No',
        };
        this.deleteConfirmationModel.confirmationMessage = this.isParentHasChildren
            ? `The page you are about to delete contains sub-pages. 
            When deleting this page, all sub-pages will be deleted as well. How do you want to proceed?`
            : 'Are you sure you want to delete this page?';
    }

    private continueDeletingPage(isSubPagesKept: boolean): void {
        this.helpCreatorService.deletePage(this.properties.pageId, isSubPagesKept).subscribe((response) => {
            if (response.status === ResponseStatusEnum.OK) {
                this.deleteConfirmationModel.showConfirmation = false;
                this.delete(this.indexNode, this.properties, true);
                this.helpCreatorService.showToastMessage('success', 'Success', 'Page deleted successfully');
            }
            this.pages = [...this.pages];
        });
    }

    private acceptDeletingPage() {
        this.continueDeletingPage(this.isParentHasChildren);
        this.removePage();
    }

    private rejectDeletingPage() {
        if (this.isParentHasChildren) {
            this.continueDeletingPage(!this.isParentHasChildren);
            const [...children] = this.getChildrenAsParent();
            const positionToInsertChildren = this.getPositionToInsertChildren();
            this.removePage();
            this.pages.splice(positionToInsertChildren, 0, ...children);
        }
        this.deleteConfirmationModel.showConfirmation = false;
    }

    private getPositionToInsertChildren(): number {
        return this.pages.map((page) => page.data.pageId).indexOf(this.indexNode.node.data.pageId);
    }

    private getChildrenAsParent(): HelpIndexModel[] {
        return this.indexNode.node.children.map((child: HelpIndexModel) => {
            return {
                data: { ...child.data, isChild: false },
                children: child?.children ?? [],
            };
        });
    }

    private removePage(): void {
        this.pages = this.pages.filter((page) => page.data.id !== this.indexNode.node.data.id);
    }

    private saveNewPage(row: HelpCenterPagePropertyModel): void {
        this.helpCreatorService.addPage(row).subscribe((response) => {
            if (response.status === ResponseStatusEnum.OK) {
                row['isEditMode'] = false;
                row.pageId = response.data['pageId'];
                row['isSaved'] = true;
                this.helpCreatorService.showToastMessage('success', 'Success', 'Page saved successfully');
            }
        });
    }

    private updatePage(row): void {
        this.updatePageEvent.emit(row);
        row['isEditMode'] = false;
        row['isSaved'] = true;
    }

    private getTemplateRow(id, pageId = 0, parentPageId = 0, isChild = false): HelpIndexModel {
        return {
            data: {
                id,
                pageId,
                parentPageId,
                isChild,
                pageTitle: '',
                isEditMode: true,
                isSaved: false,
            },
            children: [],
        };
    }

    private delete(row: HelpIndexNodeModel, properties: HelpCenterPagePropertyModel, isSaved: boolean) {
        if (isSaved && !properties.isChild) {
            this.pages = this.pages.filter((page) => page.data.id !== properties.id);
        }
        if (isSaved && properties.isChild) {
            row.parent.children = row.parent.children.filter((node) => node.data.id !== properties.id);
        }
        this.pages = [...this.pages];
    }
}
