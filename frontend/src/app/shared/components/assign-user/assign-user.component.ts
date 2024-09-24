import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AssignUserModel } from './assign-user.model';

@Component({
    selector: 'app-assign-user',
    templateUrl: './assign-user.component.html',
})
export class AssignUserComponent {
    @Input() buttonLabel: string;

    @Input() users: AssignUserModel[];

    user: AssignUserModel;

    @Output()
    assign = new EventEmitter<AssignUserModel>();

    assignUser() {
        this.assign.emit(this.user);
    }
}
