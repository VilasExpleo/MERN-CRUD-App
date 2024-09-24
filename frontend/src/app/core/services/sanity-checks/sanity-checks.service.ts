import { DateService } from 'src/app/core/services/date/date.service';
import { Injectable } from '@angular/core';
import { Roles } from './../../../../Enumerations';
import {
    ReviewerSanityCheckModel,
    SanityCheckModel,
    TranslatorSanityCheckModel,
} from './../../../shared/models/sanity-check.model';
import { UserService } from './../user/user.service';

@Injectable({
    providedIn: 'root',
})
export class SanityChecksService {
    constructor(private userService: UserService, private dateService: DateService) {}

    // TODO
    // {translationDone} translations and {proofreaddone} proofread are done.
    // You still have 'X' days until the due date./The due date expires today./You still have 1 day until the due date.
    // After finishing the order, no further work can be done. Please review the order status and confirm that the order can be closed.

    getSanityMessage(sanityCheckModel: SanityCheckModel): string {
        let remainingDaysMessage = '';

        const confirmationMessage = ` After finishing the order, no further action can be performed. <br>
        Please review the order status and confirm that the order can be closed.`;
        const role = this.userService.getUser().role;
        remainingDaysMessage = this.getRemainingDaysMessage(sanityCheckModel?.dueDate);
        switch (role) {
            case Roles.translator: {
                const translationProgressMessage = this.getTranslationProgressMessage(sanityCheckModel?.translator);
                const proofreadProgressMessage = this.getProofreadProgressMessage(sanityCheckModel?.translator);
                const doneText = ' are done.';
                return (
                    translationProgressMessage +
                    proofreadProgressMessage +
                    doneText +
                    remainingDaysMessage +
                    confirmationMessage
                );
            }
            case Roles.reviewer: {
                const reviewerProgressMessage = this.getReviewProgressMessage(sanityCheckModel?.reviewer);
                return reviewerProgressMessage + remainingDaysMessage + confirmationMessage;
            }
            case Roles.projectmanager: {
                const translationReturnMessage = this.getRequestCountMessage(
                    sanityCheckModel?.projectManager?.completedCount,
                    sanityCheckModel?.projectManager?.totalCount
                );
                return translationReturnMessage + remainingDaysMessage + confirmationMessage;
            }
            case Roles.translationmanager: {
                const requestCountMessage = this.getRequestCountMessage(
                    sanityCheckModel?.projectManager?.completedCount,
                    sanityCheckModel?.projectManager?.totalCount
                );
                return requestCountMessage + remainingDaysMessage + confirmationMessage;
            }
            default:
                return confirmationMessage;
        }
    }

    private getTranslationProgressMessage(model: TranslatorSanityCheckModel): string {
        if (model.translationProgress === 100) {
            return 'All translations';
        }

        return `${model.translationProgress}% translations`;
    }

    private getProofreadProgressMessage(model: TranslatorSanityCheckModel): string {
        if (!model.proofread) {
            return '';
        }

        if (model.proofreadProgress === 100) {
            return ' and proofread';
        }

        return ` and ${model.proofreadProgress}% proofread`;
    }

    private getReviewProgressMessage(model: ReviewerSanityCheckModel): string {
        if (model.reviewProgress === 100) {
            return 'All translations are reviewed.';
        }
        return `${model.reviewProgress}% translations are reviewed.`;
    }

    private getRemainingDaysMessage(date: Date): string {
        const remainingDays = this.dateService.getNumberOfDays(date);
        if (remainingDays === 0) {
            return ` The due date expires today.`;
        } else if (remainingDays === 1) {
            return ` You still have ${remainingDays} day until the due date.`;
        } else if (remainingDays < 0) {
            return ` The due date has expired.`;
        } else {
            return ` You still have ${remainingDays} days until the due date.`;
        }
    }

    private getRequestCountMessage(completedCount, totalCount) {
        if (totalCount === completedCount) {
            return 'All translations have been returned.';
        } else {
            return `Only ${completedCount}/${totalCount} languages have been returned.`;
        }
    }
}
