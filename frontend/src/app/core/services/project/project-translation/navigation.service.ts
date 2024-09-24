/* eslint-disable no-prototype-builtins */
import { Injectable } from '@angular/core';
import { NavigationTypes } from 'src/Enumerations';
import { ReviewTypes } from 'src/app/components/project/project-traslation-new/review-types';
import { ProjectTranslationService } from './project-translation.service';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    constructor(private projectTranslationService: ProjectTranslationService) {}
    findTextNode(data, filterBy = null, ancestor = []) {
        if (data?.length > 0 && data != undefined) {
            for (const node of data) {
                if (node?.data?.hasOwnProperty('TextNodeId')) {
                    if (!filterBy) {
                        return ancestor.concat(node);
                    } else if (filterBy && node?.data?.state !== 'Done') {
                        return ancestor.concat(node);
                    }
                }
                const foundNode = this.findTextNode(node.children, filterBy, ancestor.concat(node));
                if (foundNode) {
                    return foundNode;
                }
            }
            return undefined;
        }
    }
    findGroupNode(data, targetGroup = null, action = 'first', filterBy = null, ancestor = []) {
        if (data?.length > 0 && data != undefined) {
            for (const node of data) {
                const targetIndex = data.findIndex((item) => item === targetGroup);
                if (
                    node?.data?.hasOwnProperty('translation') &&
                    !isNaN(+node?.data?.translation?.split('/')[0]) &&
                    !node?.children?.find((item) => item.hasOwnProperty('Id')) &&
                    +node?.data?.translation?.split('/')[1] > 0 &&
                    ((!node?.hasOwnProperty('children') && !targetGroup) ||
                        (action === 'next' &&
                            targetGroup?.data?.Id !== node?.data?.Id &&
                            targetGroup?.data?.context !== node?.data?.context &&
                            targetIndex < data.findIndex((item) => item === node) &&
                            (targetGroup?.parent === node || node?.parent === targetGroup?.parent || !targetGroup) &&
                            (!filterBy ||
                                (filterBy === NavigationTypes.Unfinished &&
                                    (node?.data?.nodeCount > node?.data?.doneCount ||
                                        node?.data?.proofreadRejectedCount > 0 ||
                                        node?.data?.reviewRejectedCount > 0)) ||
                                (((filterBy === NavigationTypes.Proofread &&
                                    (node?.data?.doneCount >
                                        node?.data?.proofreadApprovedCount + node?.data?.proofreadRejectedCount ||
                                        node?.data?.reviewRejectedCount > 0)) ||
                                    (filterBy === NavigationTypes.Reviewer &&
                                        this.projectTranslationService.getProjectParameters().reviewType ===
                                            ReviewTypes.Standard &&
                                        node?.data?.doneCount >
                                            node?.data?.reviewApprovedCount + node?.data?.reviewRejectedCount &&
                                        node?.data?.doneCount > 0) ||
                                    (this.projectTranslationService.getProjectParameters().reviewType ===
                                        ReviewTypes.Screen &&
                                        node?.data?.doneCount >
                                            node?.data?.screenReviewApprovedCount +
                                                node?.data?.screenReviewRejectedCount) ||
                                    (this.isException(filterBy) && node?.data?.isExceptionNodesAvailable)) &&
                                    node?.data?.doneCount > 0))))
                ) {
                    return ancestor.concat(node);
                } else if (
                    node?.data?.hasOwnProperty('translation') &&
                    !isNaN(+node?.data?.translation?.split('/')[0]) &&
                    !node?.children?.find((item) => item.hasOwnProperty('Id')) &&
                    +node?.data?.translation?.split('/')[1] > 0 &&
                    action === 'previous' &&
                    targetGroup?.data?.Id !== node?.data?.Id &&
                    targetGroup?.data?.context !== node?.data?.context &&
                    targetIndex - 1 === data.findIndex((item) => item === node) &&
                    (targetGroup?.parent === node || node?.parent === targetGroup?.parent || !targetGroup) &&
                    (!filterBy ||
                        (filterBy === NavigationTypes.Unfinished &&
                            (node?.data?.nodeCount > node?.data?.doneCount ||
                                node?.data?.proofreadRejectedCount > 0 ||
                                node?.data?.reviewRejectedCount > 0)) ||
                        (((filterBy === NavigationTypes.Proofread &&
                            (node?.data?.doneCount >
                                node?.data?.proofreadApprovedCount + node?.data?.proofreadRejectedCount ||
                                node?.data?.reviewRejectedCount > 0)) ||
                            (filterBy === NavigationTypes.Reviewer &&
                                this.projectTranslationService.getProjectParameters().reviewType ===
                                    ReviewTypes.Standard &&
                                node?.data?.doneCount >
                                    node?.data?.reviewApprovedCount + node?.data?.reviewRejectedCount &&
                                node?.data?.doneCount > 0) ||
                            (this.projectTranslationService.getProjectParameters().reviewType === ReviewTypes.Screen &&
                                node?.data?.doneCount >
                                    node?.data?.screenReviewApprovedCount + node?.data?.screenReviewRejectedCount &&
                                this.isException(filterBy) &&
                                node?.data?.isExceptionNodesAvailable)) &&
                            node?.data?.doneCount > 0))
                ) {
                    return ancestor.concat(node);
                }

                const foundNode = this.findGroupNode(
                    node.children,
                    targetGroup,
                    action,
                    filterBy,
                    ancestor.concat(node)
                );
                if (foundNode) {
                    return foundNode;
                }
            }
            return undefined;
        }
    }
    findTopGroupNode(data, targetGroup = null, action = 'first', filterBy = null, ancestor = []) {
        if (data?.length > 0 && data != undefined) {
            for (const node of data) {
                const targetIndex = data.findIndex((item) => item === targetGroup);
                if (
                    node?.data?.hasOwnProperty('translation') &&
                    !isNaN(+node?.data?.translation?.split('/')[0]) &&
                    !node?.children?.find((item) => item.hasOwnProperty('Id')) &&
                    +node?.data?.translation?.split('/')[1] > 0 &&
                    ((!node?.hasOwnProperty('children') && !targetGroup) ||
                        (action === 'next' &&
                            targetGroup?.data?.Id !== node?.data?.Id &&
                            targetGroup?.data?.context !== node?.data?.context &&
                            targetIndex < data.findIndex((item) => item === node) &&
                            (!filterBy ||
                                (filterBy === NavigationTypes.Unfinished &&
                                    (node?.data?.nodeCount > node?.data?.doneCount ||
                                        node?.data?.proofreadRejectedCount > 0 ||
                                        node?.data?.reviewRejectedCount > 0)) ||
                                (filterBy === NavigationTypes.Proofread &&
                                    (node?.data?.doneCount >
                                        node?.data?.proofreadApprovedCount + node?.data?.proofreadRejectedCount ||
                                        node?.data?.reviewRejectedCount > 0)) ||
                                (((filterBy === NavigationTypes.Reviewer &&
                                    this.projectTranslationService.getProjectParameters().reviewType ===
                                        ReviewTypes.Standard &&
                                    node?.data?.doneCount >
                                        node?.data?.reviewApprovedCount + node?.data?.reviewRejectedCount &&
                                    node?.data?.doneCount > 0) ||
                                    (this.projectTranslationService.getProjectParameters().reviewType ===
                                        ReviewTypes.Screen &&
                                        node?.data?.doneCount >
                                            node?.data?.screenReviewApprovedCount +
                                                node?.data?.screenReviewRejectedCount) ||
                                    (this.isException(filterBy) && node?.data?.isExceptionNodesAvailable)) &&
                                    node?.data?.doneCount > 0))))
                ) {
                    return ancestor.concat(node);
                } else if (
                    node?.data?.hasOwnProperty('translation') &&
                    !isNaN(+node?.data?.translation?.split('/')[0]) &&
                    !node?.children?.find((item) => item.hasOwnProperty('Id')) &&
                    +node?.data?.translation?.split('/')[1] > 0 &&
                    ((!node?.hasOwnProperty('children') && !targetGroup) ||
                        (action === 'previous' &&
                            targetGroup?.data?.Id !== node?.data?.Id &&
                            targetGroup?.data?.context !== node?.data?.context &&
                            targetIndex - 1 === data.findIndex((item) => item === node) &&
                            (!filterBy ||
                                (filterBy === NavigationTypes.Unfinished &&
                                    (node?.data?.nodeCount > node?.data?.doneCount ||
                                        node?.data?.proofreadRejectedCount > 0 ||
                                        node?.data?.reviewRejectedCount > 0)) ||
                                (((filterBy === NavigationTypes.Proofread &&
                                    (node?.data?.doneCount >
                                        node?.data?.proofreadApprovedCount + node?.data?.proofreadRejectedCount ||
                                        node?.data?.reviewRejectedCount > 0)) ||
                                    (filterBy === NavigationTypes.Reviewer &&
                                        this.projectTranslationService.getProjectParameters().reviewType ===
                                            ReviewTypes.Standard &&
                                        node?.data?.doneCount >
                                            node?.data?.reviewApprovedCount + node?.data?.reviewRejectedCount &&
                                        node?.data?.doneCount > 0) ||
                                    (this.projectTranslationService.getProjectParameters().reviewType ===
                                        ReviewTypes.Screen &&
                                        node?.data?.doneCount >
                                            node?.data?.screenReviewApprovedCount +
                                                node?.data?.screenReviewRejectedCount) ||
                                    (this.isException(filterBy) && node?.data?.isExceptionNodesAvailable)) &&
                                    node?.data?.doneCount > 0))))
                ) {
                    return ancestor.concat(node);
                }
                const foundNode = this.findTopGroupNode(
                    node?.parent?.parent?.children || [],
                    targetGroup.parent,
                    action,
                    filterBy,
                    ancestor.concat(node)
                );
                if (foundNode) {
                    return foundNode;
                }
            }
            return undefined;
        }
    }
    findTargetTextNode(targetnode, data, ancestor = []) {
        if (data?.length > 0 && data != undefined) {
            for (const node of data) {
                if (
                    (node?.data?.hasOwnProperty('TextNodeId') || node?.parent?.data?.hasOwnProperty('TextNodeId')) &&
                    targetnode.data === node.data
                ) {
                    return ancestor.concat(node);
                }
                const foundNode = this.findTargetTextNode(targetnode, node.children, ancestor.concat(node));
                if (foundNode) {
                    return foundNode;
                }
            }
            return undefined;
        }
    }
    findTargetGroupNode(targetnode, data, ancestor = []) {
        if (data?.length > 0 && data != undefined) {
            for (const node of data) {
                if (
                    (node?.data?.hasOwnProperty('Id') || node?.parent?.data?.hasOwnProperty('Id')) &&
                    targetnode.data === node.data
                ) {
                    return ancestor.concat(node);
                }
                const foundNode = this.findTargetGroupNode(targetnode, node.children, ancestor.concat(node));
                if (foundNode) {
                    return foundNode;
                }
            }
            return undefined;
        }
    }

    isException(filterBy: string) {
        return filterBy === NavigationTypes.Exception;
    }
}
