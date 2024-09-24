import { Component, Input } from '@angular/core';
import { tableIcons, tableStatus, TextNodeStatus, TextnodeType, UnresolvedSymbols } from 'src/Enumerations';
@Component({
    selector: 'app-state-icon-button',
    templateUrl: './state-icon-button.component.html',
    styleUrls: ['./state-icon-button.component.scss'],
})
export class StateIconButtonComponent {
    @Input() value;
    @Input() className;
    @Input() colorName;
    @Input() classSpan;
    @Input() textNodeType;
    tableStatus = tableStatus;
    tableIcons = tableIcons;
    textnodeStatus = TextNodeStatus;
    unresolvedSymbols = UnresolvedSymbols;
    @Input() mapped: boolean;

    getClassNameIfSpace(value) {
        return value !== '_' && typeof value === 'string' ? value?.replaceAll(' ', '') : '';
    }
    valueText(value) {
        return this.textNodeType === 'text_type' && !TextnodeType[value] ? 'user' : value;
    }
    isUnresolveCharOrFont(status) {
        return status === 'Unresolved font' || status === 'Unresolved Chars';
    }
    isProofreaderStatus(status) {
        return (
            this.textnodeStatus[status] === 'Approved' ||
            this.textnodeStatus[status] === 'Rejected' ||
            this.textnodeStatus[status] === 'Pending'
        );
    }
}
