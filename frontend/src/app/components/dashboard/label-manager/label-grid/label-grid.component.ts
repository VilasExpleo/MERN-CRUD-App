import { Component, EventEmitter, Output, Input } from '@angular/core';
import { LabelModel } from '../label.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LabelsService } from 'src/app/core/services/labels/labels.service';
import { LabelResponseModel } from 'src/app/shared/models/labels/label-response.model';
import { ResponseStatusEnum } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';

@Component({
    selector: 'app-label-grid',
    templateUrl: './label-grid.component.html',
})
export class LabelGridComponent {
    @Input()
    labels: LabelModel[];

    @Input()
    readonly title = `All available labels for your project can be managed here. Click on an existing label to enable edit and delete options, or create a new label by clicking the button on the top.`;

    @Output()
    showLabelFormEvent = new EventEmitter<boolean>();

    @Input() projectId: number;

    selectedLabel: LabelModel;

    constructor(
        private readonly labelService: LabelsService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService
    ) {}

    createNew() {
        this.showLabelFormEvent.emit(true);
    }

    editLabel(): void {
        this.labelService.setSelectedLabel(this.selectedLabel);
        this.showLabelFormEvent.emit(true);
    }

    getRestriction(label: LabelResponseModel): string {
        return label.restriction === 'RegExp' ? label.restrictionPattern : label.restriction;
    }

    deleteLabel() {
        this.confirmationService.confirm({
            message: `You're about to delete the label "${this.selectedLabel.name}". 
            Project elements that were linked to label loose the link. Are You sure you want to proceed?`,
            header: 'Warning',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.delete();
            },
        });
    }

    private delete() {
        this.labelService
            .deleteLabel(this.selectedLabel.id, this.projectId)
            .subscribe((response: ApiBaseResponseModel) => {
                if (response?.status === ResponseStatusEnum.OK) {
                    this.labels = this.labels.filter((label) => label.id !== this.selectedLabel.id);
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: response?.message });
                }
            });
    }
}
