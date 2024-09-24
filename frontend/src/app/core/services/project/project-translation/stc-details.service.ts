/* eslint-disable no-prototype-builtins */
import { Injectable } from '@angular/core';
import { NgEventBus } from 'ng-event-bus';
import { MetaData } from 'ng-event-bus/lib/meta-data';
import { MessageService, TreeNode } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, catchError, of } from 'rxjs';
import { ResponseStatusEnum, Roles, TranslationViewType } from 'src/Enumerations';
import { CommentsModel } from 'src/app/components/project/project-traslation-new/comments/comments.model';
import { StcDetailsComponent } from 'src/app/components/project/project-traslation-new/stc-details/stc-details.component';
import { ApiService } from '../../api.service';
import { UserService } from '../../user/user.service';
import { ProjectService } from '../project.service';
import { CommentsDialogService } from './comments-dialog.service';

@Injectable({
    providedIn: 'root',
})
export class StcDetailsService {
    headerIdealText = 'Ideal Text';
    selectedRow: TreeNode;
    refObject: object;
    mappingTblRow;
    ifRowNotSelect = false;
    stcDetails = [];
    allAvailableShortForms = [];
    selectedRowIdealText;
    STCselectedRow;
    afterMappingStcId = 0;
    createStc = true;
    isTextMapped = false;
    activeEditorOptionsreadonly = false;
    lockStatus: string;
    translationSourceType = 'structure';
    tabelSelectedRow;
    language = {};

    constructor(
        private readonly apiService: ApiService,
        private readonly eventBus: NgEventBus,
        private readonly messageService: MessageService,
        private readonly dialogService: DialogService,
        private readonly projectService: ProjectService,
        private readonly user: UserService,
        private readonly commentsDialogService: CommentsDialogService
    ) {
        this.eventBus.on('translateData:translateObj').subscribe({
            next: (res: MetaData) => {
                this.selectedRow = res?.data?.treeNode;
                if (res?.data?.type === 'table') {
                    this.translationSourceType = 'Table';
                    this.tabelSelectedRow = res.data;
                    const langWiseData = this.tabelSelectedRow?.rowData?.language_data?.find(
                        (item) => item.language_id === this.tabelSelectedRow.editorLangWiseDataFromAPI.language_id
                    );
                    this.lockStatus = langWiseData?.language_props.find((item) => item.prop_name === 'Locked')?.value;
                    if (this.lockStatus === 'Locked') {
                        this.activeEditorOptionsreadonly = true;
                    } else {
                        this.activeEditorOptionsreadonly = false;
                    }

                    if (langWiseData) {
                        this.afterMappingStcId = langWiseData.stc_master_id;
                    }
                    this.allAvailableShortForms = [];
                    this.headerIdealText = 'Ideal Text';
                    this.createStc = true;

                    if (this.tabelSelectedRow?.rowData.mapped === 'Yes') {
                        this.isTextMapped = true;
                        if (langWiseData.stc_shortform_id > 0) {
                            this.headerIdealText = 'Short Form';
                        }
                        if (
                            langWiseData?.language_props.find((item) => item.prop_name === 'Text').value !== '' &&
                            langWiseData?.language_props.find((item) => item.prop_name === 'Text').value !== null
                        ) {
                            this.activeEditorOptionsreadonly = true;
                        } else {
                            this.activeEditorOptionsreadonly = false;
                        }
                    } else {
                        this.isTextMapped = false;
                    }
                    if (this.isTextMapped === true && this.activeEditorOptionsreadonly) {
                        this.createStc = false;
                    }
                } else {
                    this.translationSourceType = 'structure';
                    this.lockStatus = this.selectedRow?.data?.locked;
                    if (this.selectedRow?.data?.locked === 'Locked' || this.selectedRow?.data?.['Id']) {
                        this.activeEditorOptionsreadonly = true;
                    } else {
                        this.activeEditorOptionsreadonly = false;
                    }
                    this.afterMappingStcId = this?.selectedRow?.data?.['stc_master_id'];
                    this.allAvailableShortForms = [];
                    this.headerIdealText = 'Ideal Text';
                    this.createStc = true;

                    if (
                        this?.selectedRow?.data?.mapped === 'Yes' ||
                        this?.selectedRow?.parent?.data?.mapped === 'Yes'
                    ) {
                        this.isTextMapped = true;
                        if (this?.selectedRow?.data?.stc_shortform_id > 0) {
                            this.headerIdealText = 'Short Form';
                        }
                        if (
                            this?.selectedRow?.data?.translation !== '' &&
                            this?.selectedRow?.data?.translation !== null
                        ) {
                            this.activeEditorOptionsreadonly = true;
                        } else {
                            this.activeEditorOptionsreadonly = false;
                        }
                    } else {
                        this.isTextMapped = false;
                    }
                    if (this.isTextMapped === true && this.activeEditorOptionsreadonly) {
                        this.createStc = false;
                    }
                }
            },
        });
        this.eventBus.on('mapping:mappingtablerow').subscribe({
            next: (res: MetaData) => {
                this.mappingTblRow = res.data;
            },
        });
        this.eventBus.on('translateData:forSTCDetailsRequiredParameter').subscribe({
            next: (res: MetaData) => {
                this.translationSourceType = 'Table';
                this.tabelSelectedRow = res.data;
            },
        });
    }
    getProjectParameters() {
        if (localStorage.getItem('projectProps')) {
            const value = localStorage.getItem('projectProps');
            return JSON.parse(value);
        }
    }

    showStcDetailsDialog() {
        this.refObject = this.dialogService.open(StcDetailsComponent, {
            header: ` Details of Sample Text`,
            autoZIndex: false,
            closeOnEscape: false,
            width: '100vh',
            baseZIndex: 99999,
        });
    }
    onAccept(dialogRef: DynamicDialogRef) {
        if (this.stcDetails.length > 0) {
            if (!this.stcDetails.find((item) => item.selected)) {
                this.ifRowNotSelect = true;
            } else {
                this.ifRowNotSelect = false;
                this.eventBus.cast('stc:currentRow', this.selectedRow);
                this.detectChangesInTranslation(dialogRef);
            }
        }
    }

    setLanguageId(languageCode: string, languageId: number) {
        this.language['languageCode'] = languageCode;
        this.language['languageId'] = languageId;
    }

    rowDbClick(currentRow) {
        this.stcDetails.map((row) => (row.selected = false));
        currentRow.selected = true;
        this.STCselectedRow = currentRow;
        this.ifRowNotSelect = false;
    }
    getStcDetails() {
        const url = `stc-master/stc-detail`;
        const props = this.getProjectParameters();
        let payload: any;
        if (this.translationSourceType !== 'Table') {
            payload = {
                stc_id: this.projectService.getParentStcid(this.selectedRow),
                language_id: this.selectedRow?.data?.['language_id'],
                role: Roles[props?.userProps?.role],
                translator_id: props?.userProps?.id,
            };
        } else {
            payload = {
                stc_id: this.projectService.getParentStcidForTable(this.tabelSelectedRow?.tabelRow),
                language_id: this.tabelSelectedRow.editorLangId,
                role: Roles[props?.userProps?.role],
                translator_id: props?.userProps?.id,
            };
        }

        this.apiService
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        const sampleTextDetailsBySampleTextMasterId = res['data']?.filter(
                            (item) => item.id === this.getStcMasterId(item?.language_id)
                        );
                        if (sampleTextDetailsBySampleTextMasterId) {
                            this.getStcDetailsByStcIdAfterApiCall(sampleTextDetailsBySampleTextMasterId)
                                .pipe(catchError(() => of(undefined)))
                                .subscribe({
                                    next: (response) => {
                                        this.stcDetails = response;
                                        this.showStcDetailsDialog();
                                        if (response?.length > 0) {
                                            response.map((item) => {
                                                this.allAvailableShortForms.push({
                                                    short_form: item.Text,
                                                    short_form_id: item.id,
                                                });
                                            });
                                            const idealText = this.allAvailableShortForms.shift();
                                            this.selectedRowIdealText = idealText;
                                        }
                                    },
                                });
                        }
                    } else {
                        this.stcDetails = [];
                    }
                },
            });
    }
    updateMapping(dialogRef: DynamicDialogRef) {
        const url = `project-mapping/update-mapping-data`;
        const props = this.getProjectParameters();
        const payload = this.processPayload(props);
        this.apiService
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === ResponseStatusEnum.OK) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: res['message'],
                        });
                        if (this.translationSourceType != 'Table') {
                            this.eventBus.cast('structure:textnodeupdate', res);
                            this.selectedRow.data.translation = this.STCselectedRow.Text;
                            this.eventBus.cast('mapping:changetextaftermapping', this.selectedRow);
                        } else {
                            const tabelRow = this.tabelSelectedRow?.tabelRow;
                            const langWiseData = tabelRow?.language_data?.find(
                                (item) => item.language_id === this.tabelSelectedRow.editorLangId
                            );
                            if (langWiseData) {
                                langWiseData.language_props.find((item) => item.prop_name === 'Text').value =
                                    this.STCselectedRow.Text;
                                tabelRow.mapped = 'Yes';
                                this.eventBus.cast('mapping:changetextaftermappingFromTable', {
                                    translationText: this.STCselectedRow.Text,
                                    form: this.STCselectedRow?.Forms,
                                });
                                this.eventBus.cast('structure:textnodeupdateAfterMappingFromTabel', res);
                            }
                        }
                        dialogRef.close();
                    }
                },
            });
    }
    private processPayload(props) {
        const flagOfStcText = this.STCselectedRow?.Forms === 'Ideal Text' ? 'update_mapping' : 'update_shortform';
        let payload;
        if (this.translationSourceType != 'Table') {
            payload = {
                project_id: props?.projectId,
                version_id: props?.version,
                editor_id: props?.userProps?.id,
                textnode_id: this.selectedRow?.data?.TextNodeId ?? this.selectedRow?.parent?.data?.TextNodeId,
                variant_id: this.selectedRow?.data?.variant_id,
                array_item_index: this.selectedRow?.data?.array_item_index,
                stc_master_id: this.selectedRow?.data?.stc_master_id,
                textnode_language_id: this.selectedRow?.data?.language_id,
                stc_shortform_id: this.STCselectedRow?.id,
                flag: flagOfStcText,
            };
        } else {
            const tabelRow = this.tabelSelectedRow?.tabelRow;
            const langWiseData = tabelRow?.language_data?.find(
                (item) => item.language_id === this.tabelSelectedRow.editorLangId
            );
            if (langWiseData) {
                payload = {
                    project_id: props?.projectId,
                    version_id: props?.version,
                    editor_id: props?.userProps?.id,
                    textnode_id: tabelRow.text_node_id,
                    variant_id: tabelRow.variant_id,
                    array_item_index: tabelRow.array_item_index === '_' ? null : tabelRow.array_item_index,
                    stc_master_id: langWiseData.stc_master_id,
                    textnode_language_id: this.tabelSelectedRow.editorLangId,
                    stc_shortform_id: this.STCselectedRow?.id,
                    flag: flagOfStcText,
                };
            }
        }
        return payload;
    }
    getStcDetailsByStcIdAfterApiCall(payload): Observable<any> {
        const stcDetails: any = [];
        if (payload.length > 0) {
            const objIdealText: any = {
                Forms: 'Ideal Text',
                Rating: 100,
                Text: payload[0].ideal_text,
                selected: false,
                id: payload[0].id,
            };
            stcDetails.push(objIdealText);
            if (payload[0].stc_shortforms.length > 0) {
                payload[0].stc_shortforms.map((item, index) => {
                    const objShotForm: any = {
                        Forms: 'Short Form ' + (index + 1),
                        Rating: 100,
                        Text: item.short_form,
                        selected: false,
                        id: item.id,
                    };
                    stcDetails.push(objShotForm);
                });
            }
        }
        return of(stcDetails);
    }

    private detectChangesInTranslation(dialogRef: DynamicDialogRef) {
        const user = this.user.getUser();
        if (this.commentsDialogService.foreignLanguageChanged && user.role === Roles.editor) {
            const dialogRef = this.commentsDialogService.openCommentDialog(
                this.language['languageCode'],
                this.language['languageId']
            );
            dialogRef.onClose.subscribe((response: CommentsModel) => {
                const comments = response?.comments.filter(
                    (comment) => comment.languageId === response.textNode.languageId
                );
                if (comments?.length > 0) {
                    this.commentsDialogService.setCommentState(comments);
                    this.commentsDialogService.foreignLanguageChanged = false;
                    this.updateMapping(dialogRef);
                }
            });
        } else {
            this.updateMapping(dialogRef);
        }
    }

    private getStcMasterId(id: number): boolean {
        return this.translationSourceType === TranslationViewType.structure
            ? this.selectedRow['data']?.stc_master_id
            : this.tabelSelectedRow?.tabelRow?.['language_data'].find((language) => language?.language_id === id)
                  ?.stc_master_id;
    }
}
