import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { catchError, of } from 'rxjs';
import { LabelAssignType, ResponseStatusEnum, Roles, SelectedTreeNodeType } from 'src/Enumerations';
import { LabelsService } from 'src/app/core/services/labels/labels.service';
import { ProjectService } from 'src/app/core/services/project/project.service';
import { ApiBaseResponseModel } from '../../models/api-base-response.model';
import { LabelAssignRequestModel } from '../../models/labels/label-assign-request.model';
import { LabelOperations } from '../../models/labels/label-operations.model';
import { SourceLabelRequestModel } from '../../models/labels/source-label-request-model';
import { AssignLabelConfigModel } from './assign-label-config.model';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';

@Component({
    selector: 'app-assign-label',
    templateUrl: './assign-label.component.html',
})
export class AssignLabelComponent implements OnInit {
    sourceLabels: LabelOperations[];
    targetLabels: LabelOperations[];

    private assignLabelConfigModel: AssignLabelConfigModel;
    private currentUserRole: number;
    isMoreThanOnePostponeLabelSelected = false;
    isWarningVisible = false;
    constructor(
        private labelService: LabelsService,
        private dialogConfig: DynamicDialogConfig,
        private messageService: MessageService,
        private projectService: ProjectService,
        private dynamicDialogRef: DynamicDialogRef,
        private projectTranslationService: ProjectTranslationService
    ) {}

    ngOnInit(): void {
        this.currentUserRole = this.projectService.getProjectProperties().role;
        this.assignLabelConfigModel = this.dialogConfig.data;
        this.getTargetLabels();
        this.getSourceLabels(this.assignLabelConfigModel.projectId);
    }

    private getSourceLabels(projectId: number): void {
        this.sourceLabels = [];
        const sourceLabelModel: SourceLabelRequestModel = {
            projectId: projectId,
            type: this.type,
        };
        this.labelService.getSourceLabels(sourceLabelModel).subscribe((response) => {
            this.sourceLabels = response;
            this.sourceLabels = this.sourceLabels.filter(
                (sourceLabel) => !this.targetLabels.some((targetLabel) => targetLabel.id === sourceLabel.id)
            );
        });
    }

    private getTargetLabels(): void {
        this.targetLabels = [];
        if (this.assignedLabels.length > 0) {
            this.assignedLabels.forEach((assignedLabel) => {
                this.targetLabels.push(this.assignedLabel(assignedLabel));
            });
        } else {
            this.targetLabels = [];
        }
    }

    private assignedLabel(apiResponseLabelModel: any): LabelOperations {
        return {
            id: apiResponseLabelModel.Id ?? apiResponseLabelModel.id,
            name: apiResponseLabelModel.name,
            color: apiResponseLabelModel.color,
            icon: apiResponseLabelModel.icon,
            restriction: apiResponseLabelModel.restriction,
            restrictionPattern: apiResponseLabelModel.restrictionPattern,
            date: apiResponseLabelModel.date,
        };
    }

    private handleAssignLabelResponse(response?: ApiBaseResponseModel): void {
        if (response?.status === ResponseStatusEnum.OK) {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: response.message,
            });
            this.updateTreeOrTable();
            this.dynamicDialogRef.close();
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Failure',
                detail: response.message,
            });
        }
    }

    private updateTreeOrTable(): void {
        if (this.assignLabelConfigModel.translationSource === SelectedTreeNodeType.Structure) {
            this.assignLabelConfigModel.translationSelectedRow['node']['data']['labels'] = this.targetLabels;
        } else {
            const properties = this.editorLanguageLabelProperties.find(
                (properties) => properties.prop_name === 'Labels'
            );
            properties['value'] = this.targetLabels;
        }
        if (this.targetLabels?.filter((label) => label.date).length !== 0) {
            this.projectTranslationService.activeEditorOptions.readonly = true;
        }
        this.projectTranslationService.setProjectTranslationData();
    }

    private get type(): LabelAssignType {
        if (this.assignLabelConfigModel.translationSource === SelectedTreeNodeType.Structure) {
            return this.structureType;
        } else {
            return LabelAssignType.TextNode;
        }
    }

    private get elementId(): number {
        if (
            Object.prototype.hasOwnProperty.call(
                this.assignLabelConfigModel.translationSelectedRow['node']['data'],
                'elementId'
            )
        ) {
            return +this.assignLabelConfigModel.translationSelectedRow['node']['data']['elementId'];
        } else if (
            Object.prototype.hasOwnProperty.call(
                this.assignLabelConfigModel.translationSelectedRow['node']['data'],
                'db_text_node_id'
            ) &&
            Object.prototype.hasOwnProperty.call(
                this.assignLabelConfigModel.translationSelectedRow['node']['data'],
                'TextNodeId'
            )
        ) {
            return this.assignLabelConfigModel.translationSelectedRow['node']['data']['db_text_node_id'];
        } else {
            return this.assignLabelConfigModel.translationSelectedRow['node']['data']['db_text_node_id'];
        }
    }

    private get languageCode(): string {
        let languageCode = '';
        if (this.assignLabelConfigModel.translationSource === SelectedTreeNodeType.Structure) {
            if (
                this.isPropertyExists('db_text_node_id') &&
                this.isPropertyExists('language_id') &&
                !this.isPropertyExists('TextNodeId')
            ) {
                languageCode = this.assignLabelConfigModel.translationSelectedRow['node']['data']['context'];
            } else {
                if (!this.isPropertyExists('elementId')) languageCode = this.assignLabelConfigModel.editorLangForDone;
            }
        } else {
            languageCode = this.assignLabelConfigModel.editorLangForDone;
        }
        return languageCode;
    }

    private get payload(): LabelAssignRequestModel {
        if (this.assignLabelConfigModel.translationSource === SelectedTreeNodeType.Structure) {
            return {
                elementId: this.elementId,
                elementType: this.type,
                role: Roles[this.currentUserRole],
                labelId: this.targetLabels.map((label) => label.id),
                languageCode: this.languageCode,
            };
        } else {
            return {
                elementId: this.assignLabelConfigModel.translationSelectedRow['db_text_node_id'],
                elementType: LabelAssignType.TextNode,
                role: Roles[this.currentUserRole],
                labelId: this.targetLabels.map((label) => label.id),
                languageCode: this.languageCode,
            };
        }
    }

    private get structureType(): LabelAssignType {
        if (
            Object.prototype.hasOwnProperty.call(
                this.assignLabelConfigModel.translationSelectedRow['node']['data'],
                'Id'
            ) &&
            !Object.prototype.hasOwnProperty.call(
                this.assignLabelConfigModel.translationSelectedRow['node']['data'],
                'db_text_node_id'
            )
        ) {
            return LabelAssignType.GroupNode;
        } else if (
            Object.prototype.hasOwnProperty.call(
                this.assignLabelConfigModel.translationSelectedRow['node']['data'],
                'TextNodeId'
            ) &&
            Object.prototype.hasOwnProperty.call(
                this.assignLabelConfigModel.translationSelectedRow['node']['data'],
                'db_text_node_id'
            )
        ) {
            return LabelAssignType.TextNode;
        } else {
            return LabelAssignType.Translation;
        }
    }

    private get assignedLabels() {
        if (this.assignLabelConfigModel.translationSource === SelectedTreeNodeType.Structure) {
            return this.assignLabelConfigModel.translationSelectedRow['node']['data']['labels'] ?? [];
        } else {
            return (
                this.editorLanguageLabelProperties.find((properties) => properties.prop_name === 'Labels').value ?? []
            );
        }
    }

    assignLabel(): void {
        if (this.isMoreThanOnePostponeLabelSelected) {
            return;
        } else {
            this.labelService
                .assignLabelToNode(this.payload, this.assignLabelConfigModel.projectId)
                .pipe(catchError(() => of(undefined)))
                .subscribe((response) => this.handleAssignLabelResponse(response));
        }
    }

    private get editorLanguageLabelProperties() {
        return this.assignLabelConfigModel.translationSelectedRow?.language_data.find(
            (language) => language.language_code == this.assignLabelConfigModel.editorLangForDone
        ).language_props;
    }

    checkDuplicateLabels() {
        const pairs = this.targetLabels.flatMap((item, index) =>
            this.targetLabels.slice(index + 1).map((nextItem) => [item, nextItem])
        );

        const hasValidPair = pairs.some(([item1, item2]) => this.hasValidDate(item1) && this.hasValidDate(item2));

        if (hasValidPair) {
            this.isMoreThanOnePostponeLabelSelected = true;
            this.isWarningVisible = true;
        }
    }

    private hasValidDate(item) {
        return item.date && new Date(item.date).toString() !== 'Invalid Date';
    }

    getOriginalLabelsOrder() {
        this.isWarningVisible = false;
        this.isMoreThanOnePostponeLabelSelected = false;
        const noPostponeLabels = this.targetLabels.filter((label) => !label.date);
        const postponeLabels = this.targetLabels.filter((label) => label.date);
        if (postponeLabels[0]) {
            noPostponeLabels.push(postponeLabels[0]);
        }
        const otherPostponeLabels = postponeLabels.slice(1);
        this.targetLabels = [...noPostponeLabels];
        this.sourceLabels = [...this.sourceLabels, ...otherPostponeLabels];
    }

    isPropertyExists(property: string): boolean {
        return Object.prototype.hasOwnProperty.call(
            this.assignLabelConfigModel.translationSelectedRow['node']['data'],
            property
        );
    }
}
