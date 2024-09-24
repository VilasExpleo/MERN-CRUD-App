import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SanityChecksService } from 'src/app/core/services/sanity-checks/sanity-checks.service';
import { ManagerSanityCheckModel } from 'src/app/shared/models/sanity-check.model';
import { TranslationResponse } from './complete-translation-request.model';
@Component({
    selector: 'app-complete-translation-request',
    templateUrl: './complete-translation-request.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompleteTranslationRequestComponent {
    @Input()
    isVisible = false;

    @Input()
    headerText = 'Finish Translation Request';

    @Input()
    model: TranslationResponse;

    @Output()
    completeTranslationEvent = new EventEmitter<void>();

    @Output()
    cancelEvent = new EventEmitter();

    @Input()
    messageIfAllLanguagesTranslated = 'translation has been completed.';

    @Input()
    message = 'Do you want to finish translation request?';

    constructor(private sanityChecksService: SanityChecksService) {}

    cancel() {
        this.cancelEvent.emit();
    }

    getSanityMessage(): string {
        const projectManagerSanityCheckModel: ManagerSanityCheckModel = {
            totalCount: this.model?.totalCount,
            completedCount: this.model?.completedCount,
        };
        return this.sanityChecksService.getSanityMessage({
            projectManager: projectManagerSanityCheckModel,
            dueDate: this.model?.dueDate,
        });
    }

    completeTranslation() {
        this.completeTranslationEvent.emit();
    }
}
