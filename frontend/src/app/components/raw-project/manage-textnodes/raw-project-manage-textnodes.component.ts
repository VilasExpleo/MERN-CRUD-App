import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, of, tap } from 'rxjs';
import { InputConfigModel, RawProjectColumnModel } from 'src/app/shared/models/data-creator/raw-project-column.model';
import { TextnodeType } from '../../../../Enumerations';
import { RawProjectTextnodeService } from '../../../core/services/data-creator/raw-project-textnode.service';
import { InputTypeEnum } from '../../../shared/enums/input-type.enum';
import { LineBreakEnum } from '../../../shared/enums/line-break.enum';
import { NodeSubTypeEnum } from '../../../shared/enums/node-sub-type.enum';
import { NodeTypeEnum } from '../../../shared/enums/node-type.enum';
import {
    FontPackageModel,
    LengthCalculationModel,
    ManageRawProjectModel,
    VariantModel,
} from '../../dashboard/data-creator-dashboard/create-raw-project-dialog/manage-raw-project-state.model';
import { RawProjectManageTextNodesModel } from './raw-project-manage-textnodes.model';
import { RawProjectTextNodeModel } from './raw-project-textnode.model';
import { RowNodeModel } from './row-node.model';
import { RawProjectTextnodeAvailableOptionsTransformer } from './transformer/raw-project-textnode-available-options.transformer';

@Component({
    selector: 'app-raw-project-manage-text-node',
    templateUrl: './raw-project-manage-textnodes.component.html',
})
export class RawProjectManageTextnodesComponent implements OnInit {
    model: RawProjectManageTextNodesModel;
    isLoading = true;
    rawProject: ManageRawProjectModel;
    NodeTypeEnum = NodeTypeEnum;
    inputTypeEnum = InputTypeEnum;
    rawProjectId = 0;
    nodes: RawProjectTextNodeModel[] = [];
    cols: RawProjectColumnModel[] = [];
    draggedNode: RowNodeModel | null = null;
    nodeExtracted: RawProjectTextNodeModel[];

    selectedTreeNode: RawProjectTextNodeModel;
    newTreeNode: RawProjectTextNodeModel;
    selectedTreeNodes: RawProjectTextNodeModel[] | null;
    originalNode: RawProjectTextNodeModel;

    defaultFont: FontPackageModel = null;
    defaultVariant: VariantModel = null;
    defaultLengthCalculation: LengthCalculationModel = null;
    defaultLineBreakMode = '';

    deleteConfirmationModel = {
        showConfirmation: false,
        confirmationHeader: 'Warning',
        confirmationMessage: 'Are you sure you want to delete this text node?',
        onAccept: () => {
            this.continueDeleting();
        },
        onReject: () => {
            this.deleteConfirmationModel.showConfirmation = false;
        },
    };

    typeFolder: any[] = [
        { value: NodeSubTypeEnum.StandardGroup, name: NodeSubTypeEnum.StandardGroup },
        { value: NodeSubTypeEnum.Project, name: NodeSubTypeEnum.Project },
        { value: NodeSubTypeEnum.Module, name: NodeSubTypeEnum.Module },
        { value: NodeSubTypeEnum.Widget, name: NodeSubTypeEnum.Widget },
        { value: NodeSubTypeEnum.View, name: NodeSubTypeEnum.View },
        { value: NodeSubTypeEnum.ConcatText, name: NodeSubTypeEnum.ConcatText },
        { value: NodeSubTypeEnum.Teleprompter, name: NodeSubTypeEnum.Teleprompter },
        { value: NodeSubTypeEnum.List, name: NodeSubTypeEnum.List },
    ];

    typeTextNode: any[] = [
        { value: NodeSubTypeEnum.MetaText, name: NodeSubTypeEnum.MetaText },
        { value: NodeSubTypeEnum.DisplayText, name: NodeSubTypeEnum.DisplayText },
        { value: NodeSubTypeEnum.SpeechCommand, name: NodeSubTypeEnum.SpeechCommand },
        { value: NodeSubTypeEnum.SpeechPrompt, name: NodeSubTypeEnum.SpeechPrompt },
        { value: NodeSubTypeEnum.SdsCommand, name: NodeSubTypeEnum.SdsCommand },
        { value: NodeSubTypeEnum.SdsPrompt, name: NodeSubTypeEnum.SdsPrompt },
        { value: NodeSubTypeEnum.SdsText, name: NodeSubTypeEnum.SdsText },
        { value: NodeSubTypeEnum.ConcatString, name: NodeSubTypeEnum.ConcatString },
    ];

    constructor(
        private route: ActivatedRoute,
        private rawProjectTextnodeService: RawProjectTextnodeService,
        private messageService: MessageService,
        private rawProjectTextnodeAvailableOptionsTransformer: RawProjectTextnodeAvailableOptionsTransformer
    ) {
        this.route.params.subscribe((params) => {
            this.rawProjectId = +params['rawProjectId'];
        });
    }

    ngOnInit(): void {
        this.rawProjectTextnodeService
            .getModel(this.rawProjectId)
            .pipe(
                catchError(() => of(undefined)),
                tap(() => (this.isLoading = false))
            )
            .subscribe((response: RawProjectManageTextNodesModel) => {
                // handle the error case
                this.nodes = response?.nodes ?? [];
                this.rawProject = response?.properties;
                this.initializeColumns();
            });
    }

    private getNodeWithDefaultValues(
        parentId: number,
        positionInParent: number,
        nodeType: NodeTypeEnum
    ): RawProjectTextNodeModel {
        return {
            key: null,
            rawProjectId: +this.rawProjectId,
            parentId: parentId,
            nodeSubType: nodeType == NodeTypeEnum.Group ? NodeSubTypeEnum.Folder : NodeSubTypeEnum.DisplayText,
            nodeType: nodeType,
            positionInParent: positionInParent,
            name: '',
            source: '',
            variantId: this.defaultVariant?.id ?? null,
            maxWidth: null,
            maxLength: null,
            maxLines: null,
            lengthCalculationId: this.defaultLengthCalculation?.id ?? null,
            children: [],
            lineBreakMode: this.defaultLineBreakMode,
            fontId: +this.defaultFont?.id ?? null,
            editMode: true,
        };
    }

    onAddNew(nodeType: NodeTypeEnum, parentId = 0, node?: RawProjectTextNodeModel) {
        const parent = this.findNodeById(this.nodes, parentId);
        let positionInParent = 1;
        if (parentId !== 0) {
            node['expanded'] = true;
        }

        if (parent) {
            const lastChild = parent.children.slice(-1)[0];
            if (lastChild) {
                positionInParent += lastChild.positionInParent;
            }
        }
        this.addNew(parentId, positionInParent, nodeType, node);
    }

    isNodeTypeGroupAndNotEditMode(row: RowNodeModel): boolean {
        return !row.node.editMode && row.node.nodeType === NodeTypeEnum.Group;
    }

    isTextNodeNotSingleSelection(inputConfig: InputConfigModel, rowNode: RowNodeModel): boolean {
        return this.isColumnTextNode(inputConfig, rowNode) && inputConfig.type !== this.inputTypeEnum.SingleSelect;
    }
    isTextNodeSingleSelection(inputConfig: InputConfigModel, rowNode: RowNodeModel): boolean {
        return this.isColumnTextNode(inputConfig, rowNode) && inputConfig.type === this.inputTypeEnum.SingleSelect;
    }

    private isColumnTextNode(inputConfig: InputConfigModel, rowNode: RowNodeModel): boolean {
        return inputConfig.field !== 'nodeSubType' && rowNode.node.nodeType === NodeTypeEnum.Textnode;
    }

    private addNew(parentId: number, positionInParent: number, nodeType: NodeTypeEnum, node: RawProjectTextNodeModel) {
        const newNode = this.getNodeWithDefaultValues(parentId, positionInParent, nodeType);
        this.rawProjectTextnodeService
            .createNode(newNode)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response) => {
                    if (response) {
                        newNode.key = response;
                        this.originalNode = { ...newNode };
                        parentId === 0 ? this.nodes.push(newNode) : node.children.push(newNode);
                        this.nodes = [...this.nodes];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: `${nodeType} saved successfully`,
                        });
                    }
                },
            });
    }

    startEdit(row: RowNodeModel) {
        this.originalNode = { ...row.node };
        row.node.editMode = true;
    }

    editNode(rowNode: RowNodeModel) {
        rowNode.node.editMode = false;

        this.rawProjectTextnodeService
            .updateNode(rowNode.node)
            .pipe(catchError((error) => of(error)))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: `${rowNode.node.nodeType} updated successfully`,
                    });
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'warning',
                        summary: 'Warning',
                        detail: `${rowNode.node.nodeType} could not be saved. Error: ` + error,
                    });
                },
            });
    }

    duplicateNode(rowNode: RawProjectTextNodeModel) {
        this.rawProjectTextnodeService
            .duplicateNode(rowNode.key)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: () => {
                    //this.insertNode(this.nodes, rowNode.key || null, true, duplicateNode);
                    this.nodes = [...this.nodes];
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'warning',
                        summary: 'Warning',
                        detail: 'Node not duplicated correctly, Error: ' + error,
                    });
                },
            });
    }

    cancelEdit(row: RowNodeModel) {
        //this is triggering change detection
        if (this.originalNode) {
            row.node.name = this.originalNode.name;
            row.node.source = this.originalNode.source;
            row.node.variantId = this.originalNode.variantId;
            row.node.maxWidth = this.originalNode.maxWidth;
            row.node.maxLength = this.originalNode.maxLength;
            row.node.maxLines = this.originalNode.maxLines;
            row.node.lengthCalculationId = this.originalNode.lengthCalculationId;
            row.node.nodeSubType = this.originalNode.nodeSubType;
            row.node.fontId = this.originalNode.fontId;
            row.node.editMode = this.originalNode.editMode;
            row.node.lineBreakMode = this.originalNode.lineBreakMode;
        }
        row.node.editMode = false;

        this.nodes = [...this.nodes];
    }

    deleteNode(node: RawProjectTextNodeModel) {
        this.selectedTreeNode = node;
        this.deleteConfirmationModel.confirmationMessage = `Are you sure you want to delete the selected ${node.nodeType.toLocaleLowerCase()} node?`;
        if (node.nodeType === NodeTypeEnum.Group && node.children.length > 0) {
            this.deleteConfirmationModel.confirmationMessage = `You're about to delete a group node. As a result, all child groups and text nodes will be deleted. Are you sure you want to proceed?`;
        }

        this.deleteConfirmationModel.showConfirmation = true;
    }

    private continueDeleting() {
        if (this.selectedTreeNode) {
            this.rawProjectTextnodeService
                .deleteNode(this.rawProjectId, this.selectedTreeNode.key)
                .pipe(catchError(() => of(undefined)))
                .subscribe({
                    next: () => {
                        this.recursiveDeleting(this.selectedTreeNode, this.nodes);
                        this.nodes = [...this.nodes];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: `${this.selectedTreeNode.nodeType} deleted successfully.`,
                        });
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'warning',
                            summary: 'Warning',
                            detail: 'Node not Deleted Error: ' + error,
                        });
                    },
                    complete: () => {
                        this.deleteConfirmationModel.showConfirmation = false;
                    },
                });
        }
    }

    private recursiveDeleting(node: RawProjectTextNodeModel, dataArr: RawProjectTextNodeModel[]) {
        for (const [index, currentNode] of dataArr.entries()) {
            if (currentNode.key === node.key) {
                dataArr.splice(index, 1);
                this.nodes = [...this.nodes];
                return true;
            }

            // If the node has children, search within its children array
            if (currentNode.children) {
                if (this.recursiveDeleting(node, currentNode.children)) {
                    return true;
                }
            }
        }
        return false;
    }

    //=== section functions to implement drag and drop functionality.
    dragStart(event: any, node: RowNodeModel) {
        this.draggedNode = node;
    }

    drop(event: DragEvent) {
        if (event.target['id']) {
            this.getNode(this.draggedNode.node.key, this.nodes);
            this.moveTo(event.target['id'], this.nodes);
        }
    }

    moveTo(targetId: number, data: RawProjectTextNodeModel[]) {
        for (let i = 0; i < data.length; i++) {
            const currentNode = data[i];
            if (currentNode.key == targetId) {
                currentNode.children?.push(this.nodeExtracted[0]);
                this.nodes = [...this.nodes];
                return true;
            }
            if (currentNode.children) {
                if (this.moveTo(targetId, currentNode.children)) {
                    return true;
                }
            }
        }
        return false;
    }

    getNode(key: number | undefined, data: RawProjectTextNodeModel[]) {
        if (key) {
            for (let i = 0; i < data.length; i++) {
                const currentNode = data[i];
                if (currentNode.key == key) {
                    this.nodeExtracted = data.splice(i, 1);
                    this.nodeExtracted[0].parentId = null;
                    this.nodes = [...this.nodes];
                    return true;
                }
                if (currentNode.children) {
                    if (this.getNode(key, currentNode.children)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    dragEnd() {
        this.draggedNode = null;
    }

    getListOfSubType(nodeType: string) {
        if (nodeType === NodeTypeEnum.Group) {
            return this.typeFolder;
        }
        if (nodeType === NodeTypeEnum.Textnode) {
            return this.typeTextNode;
        }
        return [];
    }

    getNameFromCode(col: RawProjectColumnModel, rowNode: RowNodeModel): string {
        return col.inputConfig.options.find((ele) => ele.code === rowNode.node[col.inputConfig.field])?.name ?? '';
    }

    private findNodeById(tree, id: number): RawProjectTextNodeModel | null {
        let result = null;
        if (tree.key === id) {
            return tree;
        }

        if (Array.isArray(tree.children) && tree.children.length > 0) {
            tree.children.some((node) => {
                result = this.findNodeById(node, id);
                return result;
            });
        }
        return result;
    }

    private initializeColumns() {
        this.defaultFont = this.rawProject.fontPackages.find((el) => el.isDefault);
        this.defaultVariant = this.rawProject.variants.find((el) => el.isDefault);
        this.defaultLengthCalculation = this.rawProject.lengthCalculations.find((el) => el.isDefault);

        this.cols = [
            {
                header: 'Type',
                inputConfig: {
                    field: 'nodeSubType',
                    type: InputTypeEnum.SingleSelect,
                    optionValue: 'code',
                    optionLabel: 'name',
                    options: this.rawProjectTextnodeAvailableOptionsTransformer.transformAvailableTextnodeTypes(
                        Object.keys(TextnodeType).filter((v) => isNaN(Number(v)))
                    ),
                },
            },
            {
                header: 'Name',
                inputConfig: {
                    field: 'name',
                    type: InputTypeEnum.Text,
                },
            },
            {
                header: 'Source',
                inputConfig: {
                    field: 'source',
                    type: InputTypeEnum.Text,
                    optionLabel: 'name',
                },
            },
            {
                header: 'Max.Length(Char.)',
                inputConfig: {
                    field: 'maxLength',
                    type: InputTypeEnum.Number,
                    optionLabel: '',
                },
            },
            {
                header: 'Max.Width(px)',
                inputConfig: {
                    field: 'maxWidth',
                    type: InputTypeEnum.Number,
                    optionLabel: '',
                },
            },
            {
                header: 'Max. Lines',
                inputConfig: {
                    field: 'maxLines',
                    type: InputTypeEnum.Number,
                    optionLabel: '',
                },
            },
            {
                header: 'Line Break Mode',
                inputConfig: {
                    field: 'lineBreakMode',
                    type: InputTypeEnum.SingleSelect,
                    optionLabel: 'name',
                    optionValue: 'code',
                    options: this.rawProjectTextnodeAvailableOptionsTransformer.transformAvailableLineBreakOptions([
                        LineBreakEnum.WORD,
                        LineBreakEnum.MANUAL,
                    ]),
                },
            },
            {
                header: 'Font',
                inputConfig: {
                    field: 'fontId',
                    type: InputTypeEnum.SingleSelect,
                    optionLabel: 'name',
                    optionValue: 'code',
                    options: this.rawProjectTextnodeAvailableOptionsTransformer.transformFonts(this.rawProject.fonts),
                },
            },
            {
                header: 'Length Calculation',
                inputConfig: {
                    field: 'lengthCalculationId',
                    type: InputTypeEnum.SingleSelect,
                    optionLabel: 'name',
                    optionValue: 'code',
                    options: this.rawProjectTextnodeAvailableOptionsTransformer.transformAvailableLengthCalculations(
                        this.rawProject.lengthCalculations
                    ),
                },
            },
            {
                header: 'Variants',
                inputConfig: {
                    field: 'variantId',
                    type: InputTypeEnum.SingleSelect,
                    optionLabel: 'name',
                    optionValue: 'code',
                    options: this.rawProjectTextnodeAvailableOptionsTransformer.transformAvailableVariants(
                        this.rawProject.variants
                    ),
                },
            },
            {
                header: '',
                inputConfig: {
                    field: 'actions',
                    type: 'None',
                    optionLabel: '',
                },
            },
        ];
    }
}
