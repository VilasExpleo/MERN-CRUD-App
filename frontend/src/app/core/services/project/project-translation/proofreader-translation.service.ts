import { Injectable } from '@angular/core';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { TreeNode } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { Roles, TranslationStatusEnum, TranslationViewType } from 'src/Enumerations';
import { ApiService } from '../../api.service';
import { UserService } from '../../user/user.service';
import { ProjectService } from '../project.service';
import { ProofreadTranslationRequestModel } from './../../../../shared/models/proofreader/proofread-api.model';
import { CommentsService } from './comments.service';
import { ProjectTranslationService } from './project-translation.service';
import { TextnodeHistoryService } from './textnode-history.service';
@Injectable({
    providedIn: 'root',
})
export class ProofreaderTranslationService {
    selectedRow: TreeNode;
    gridType = TranslationViewType['structure'];
    tableData;
    languageState;
    oldProofreadStatus: number;
    constructor(
        private apiService: ApiService,
        private eventBus: NgEventBus,
        private userService: UserService,
        private projectService: ProjectService,
        private commentsService: CommentsService,
        private textnodeHistoryService: TextnodeHistoryService,
        private projectTranslationService: ProjectTranslationService
    ) {
        this.eventBus.on('translateData:translateObj').subscribe({
            next: (res: MetaData) => {
                this.gridType = res?.data?.type;
                if (res?.data?.type === TranslationViewType['table']) {
                    this.languageState = res?.data?.translateObj?.state;
                    this.selectedRow = res?.data?.rowData;
                } else {
                    this.selectedRow = res?.data?.treeNode;
                }
            },
        });
    }

    getLoggedInUserInformation() {
        return this.userService.getUser();
    }
    getTableRowProperties() {
        return {
            nodeId: this.selectedRow?.['text_node_id'],
            arrayItemIndex:
                this.selectedRow?.['array_item_index'] === '_' ? null : this.selectedRow?.['array_item_index'],
            variantId: this.selectedRow?.['variant_id'],
            dbProjectTextNodeId: this.selectedRow?.['db_text_node_id'],
            languageId: this.selectedRow?.['language_data'][0]?.['language_id'],
        };
    }
    changeTextnodeStatus(status, comment = '') {
        const user = this.getLoggedInUserInformation();
        if (this.gridType === TranslationViewType['structure']) {
            if (user?.role === Roles['proofreader'] && this.selectedRow.data.state !== 'Done') {
                return;
            }
        } else {
            if (user?.role === Roles['proofreader'] && this.languageState !== 'Done') {
                return;
            }
        }

        this.changeStatus(status, comment, user);
    }

    changeStatus(status: number, comment: string, user: any) {
        const url = `proofread/changeStatus`;
        const projectProps = this.projectService.getProjectProperties();
        const payload: ProofreadTranslationRequestModel = {
            projectId: projectProps?.projectId,
            versionId: projectProps?.version,
            userId: user?.id,
            translationRequestId: projectProps?.translationRequestId,
            comments: [
                {
                    nodeId:
                        this.gridType === TranslationViewType['structure']
                            ? this.selectedRow?.data?.TextNodeId
                            : this.getTableRowProperties().nodeId,
                    arrayItemIndex:
                        this.gridType === TranslationViewType['structure']
                            ? this.selectedRow?.data?.array_item_index
                            : this.getTableRowProperties().arrayItemIndex,
                    variantId:
                        this.gridType === TranslationViewType['structure']
                            ? this.selectedRow?.data?.variant_id
                            : this.getTableRowProperties().variantId,
                    dbProjectTextNodeId:
                        this.gridType === TranslationViewType['structure']
                            ? this.selectedRow?.data?.db_text_node_id
                            : this.getTableRowProperties().dbProjectTextNodeId,
                    languageId:
                        this.gridType === TranslationViewType['structure']
                            ? this.selectedRow?.data?.language_id
                            : this.getTableRowProperties().languageId,
                    status: status,
                    comment: comment,
                    languageCode:
                        user?.role == Roles.translator
                            ? projectProps?.sourceLangCode
                            : projectProps?.proofreaderLangCode,
                },
            ],
        };

        this.apiService
            .patchTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (response) => {
                    if (response?.['status'] === 'OK') {
                        if (this.gridType === TranslationViewType['structure']) {
                            this.oldProofreadStatus = this.selectedRow.data['proofread_status'];
                            this.selectedRow.data['proofread_status'] = status;
                            this.selectedRow.data['proofread_comment'] = comment;
                            if (this.oldProofreadStatus !== status) {
                                this.countApproveTextNodesForProofreader(this.projectTranslationService.allParentGroup);
                            }
                            this.textnodeHistoryService.getTextnodeHistory(null, null, TranslationViewType.structure);
                        } else {
                            this.selectedRow?.['language_data']?.[0]?.['language_props']?.forEach((language) => {
                                switch (language.prop_name) {
                                    case 'Proofread Status': {
                                        language.value = status;
                                        break;
                                    }
                                    case 'Proofread Comment': {
                                        language.value = comment;
                                        break;
                                    }
                                    default: {
                                        break;
                                    }
                                }
                            });
                            this.textnodeHistoryService.getTextnodeHistory(null, null, TranslationViewType.table);
                        }

                        this.eventBus.cast(
                            'RejectedStatus:Comment',
                            this.commentsService.getTransformedComments(response['data'])
                        );
                    }
                },
            });
    }

    countApproveTextNodesForProofreader(parents: any) {
        parents.forEach((parent) => {
            let count = parent?.data?.proofreadApprovedCount;
            if (this.selectedRow['data']['proofread_status'] === TranslationStatusEnum.Done) {
                count += 1;
            }
            if (this.selectedRow['data']['proofread_status'] !== TranslationStatusEnum.Done && count > 0) {
                count -= 1;
            }
            parent.data.proofread_status = `${count}/${parent?.data?.nodeCount}`;
            parent.data.proofreadApprovedCount = count;
        });
    }
}
