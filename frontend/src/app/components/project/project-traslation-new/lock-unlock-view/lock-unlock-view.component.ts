import { Component } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProjectTranslationService } from 'src/app/core/services/project/project-translation/project-translation.service';
import { Status } from 'src/Enumerations';

@Component({
    selector: 'app-lock-unlock-view',
    templateUrl: './lock-unlock-view.component.html',
})
export class LockUnlockViewComponent {
    statusIcon = Status;
    constructor(private ref: DynamicDialogRef, public projectTranslationService: ProjectTranslationService) {}

    lockMultipleTextnodes() {
        this.projectTranslationService.lockMultipleTextnodes(undefined, 'Table');
        this.ref.close();
    }

    hideLockUnlockDialog() {
        this.ref.close();
    }
}
