import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { OverlayPanel } from 'primeng/overlaypanel';
import { OverlayHeaders } from 'src/Enumerations';
import { UsersRoles } from 'src/Enumerations';
import { UserService } from 'src/app/core/services/user/user.service';

@Component({
    selector: 'app-overlay-panel',
    templateUrl: './overlay-panel.component.html',
})
export class OverlayPanelComponent implements OnInit {
    @Input()
    overlayPanel: OverlayPanel;

    @Output()
    setComment = new EventEmitter();

    dialogHeading = OverlayHeaders.reviewComment;
    comment = '';
    linkId = '';

    constructor(
        @Optional() private dialogConfig: DynamicDialogConfig,
        @Optional() private dialogRef: DynamicDialogRef,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.linkId = this.dialogConfig?.data?.linkId ?? '';
        this.setOverlayHeaders();
    }
    setOverlayHeaders() {
        if (this.userRole === UsersRoles.Proofreader) {
            this.dialogHeading = OverlayHeaders.proofreadComment;
        } else this.dialogHeading = OverlayHeaders.reviewComment;
    }

    addComment(): void {
        this.setComment.emit(this.comment);
        if (this.dialogRef) {
            this.dialogRef?.close(this.comment);
        } else {
            this.overlayPanel?.hide();
        }
        this.comment = '';
    }

    cancelDialog(): void {
        this.dialogRef?.close();
        this.overlayPanel?.hide();
        this.comment = '';
    }
    get userRole(): number {
        return this.userService.getUser().role;
    }
}
