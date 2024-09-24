import { Injectable } from '@angular/core';
import { MetaData, NgEventBus } from 'ng-event-bus';
import { TreeNode } from 'primeng/api';
import { catchError, of } from 'rxjs';
import { ResponseStatusEnum, Roles, TranslationStatus, TranslationViewType } from 'src/Enumerations';
import { ApiBaseResponseModel } from 'src/app/shared/models/api-base-response.model';
import { ReviewerTranslationRequestModel } from 'src/app/shared/models/reviewer/reviewer-api.model';
import { ApiService } from '../../api.service';
import { UserService } from '../../user/user.service';
import { ProjectService } from '../project.service';
import { CommentsService } from './comments.service';
import { TextnodeHistoryService } from './textnode-history.service';
import { ApproveRejectViewRequestModel } from 'src/app/shared/models/reviewer/approve-reject-view-request.model';
import { ReviewTypeEnum } from 'src/app/components/dashboard/order-review/components/language/review-type.enum';
@Injectable({
    providedIn: 'root',
})
export class ReviewerTranslationService {
    selectedRow: TreeNode;
    gridType = TranslationViewType['structure'];
    tableData;
    languageState;
    constructor(
        private apiService: ApiService,
        private eventBus: NgEventBus,
        private userService: UserService,
        private projectService: ProjectService,
        private commentsService: CommentsService,
        private textnodeHistoryService: TextnodeHistoryService
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
            if (user?.role === Roles.reviewer && this.selectedRow.data.state !== 'Done') {
                return;
            }
        } else {
            if (user?.role === Roles.reviewer && this.languageState !== 'Done') {
                return;
            }
        }

        this.changeStatus(status, comment, user);
    }

    changeStatus(status: number, comment: string, user: any) {
        const url = `review/change-status`;
        const projectProps = this.projectService.getProjectProperties();
        const payload: ReviewerTranslationRequestModel = {
            projectId: projectProps?.projectId,
            versionId: projectProps?.version,
            userId: user?.id,
            requestId: projectProps?.translationRequestId,
            reviewType: projectProps?.reviewType,
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
                            if (!this.isScreenReviewType()) {
                                this.selectedRow.data['screen_review_status'] = status;
                                this.selectedRow.data['screen_review_comment'] = comment;
                            } else {
                                this.selectedRow.data['review_status'] = status;
                                this.selectedRow.data['review_comment'] = comment;
                            }
                            this.textnodeHistoryService.getTextnodeHistory(null, null, TranslationViewType.structure);
                        } else {
                            this.selectedRow?.['language_data']?.[0]?.['language_props']?.forEach((language) => {
                                switch (!!language.prop_name) {
                                    case this.isReviewTypeScreen(
                                        language.prop_name,
                                        'Review Status',
                                        this.isScreenReviewType()
                                    ):
                                        language.value = status;
                                        break;

                                    case this.isReviewTypeScreen(
                                        language.prop_name,
                                        'Review Comment',
                                        this.isScreenReviewType()
                                    ): {
                                        language.value = comment;
                                        break;
                                    }
                                    case this.isReviewTypeScreen(
                                        language.prop_name,
                                        'ScreenReview Status',
                                        !this.isScreenReviewType()
                                    ): {
                                        language.value = status;
                                        break;
                                    }
                                    case this.isReviewTypeScreen(
                                        language.prop_name,
                                        'ScreenReview Comment',
                                        !this.isScreenReviewType()
                                    ): {
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

    approveRejectView(status, comment = '') {
        const url = `review/bulk-change-status`;
        const projectProps = this.projectService.getProjectProperties();
        const payload: ApproveRejectViewRequestModel = {
            projectId: projectProps?.projectId,
            viewName: this.selectedRow?.data?.context,
            reviewStatus: status,
            reviewComment: comment,
            lang: projectProps?.reviewerLangCode,
            requestId: projectProps?.translationRequestId,
        };

        this.apiService
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe((response: ApiBaseResponseModel) => {
                if (response.status === ResponseStatusEnum.OK) {
                    this.setTextNodeStatusAndComment(status, comment);
                }
            });
    }

    private setTextNodeStatusAndComment(status, comment): void {
        this.selectedRow?.children?.forEach((child) => {
            child?.children?.forEach((node) => {
                if (node.data.state === TranslationStatus.Done) {
                    node.data.screen_review_status = status;
                    node.data.screen_review_comment = comment;
                }
            });
        });
    }

    private isScreenReviewType(): boolean {
        const projectProps = this.projectService.getProjectProperties();
        return projectProps?.reviewType === ReviewTypeEnum.Standard;
    }

    private isReviewTypeScreen(property: string, languageProperty: string, isScreenType: boolean): boolean {
        return property === languageProperty && isScreenType;
    }
}
