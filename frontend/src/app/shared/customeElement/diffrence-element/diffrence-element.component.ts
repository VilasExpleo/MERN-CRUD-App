import { AfterViewInit, Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';

declare let patienceDiffPlus;
@Component({
    selector: 'app-diffrence-element',
    templateUrl: './diffrence-element.component.html',
})
export class DiffrenceElementComponent implements AfterViewInit {
    @Input() oldValue;
    @Input() newValue;

    @ViewChild('finalText') finalText: ElementRef;

    result = '';

    constructor(private renderer: Renderer2) {}
    ngAfterViewInit(): void {
        let difference;
        let newSpan;
        if (this.oldValue && this.newValue) {
            difference = new patienceDiffPlus(this.oldValue.split(' '), this.newValue.split(' '));
            difference.lines.forEach((element) => {
                newSpan = this.renderer.createElement('span');
                if (element.aIndex === -1 || (element.bIndex >= 0 && element.aIndex >= 0 && element?.moved === true)) {
                    this.renderer.addClass(newSpan, 'text-green-500');
                }
                if (element.bIndex === -1) {
                    this.renderer.addClass(newSpan, 'text-red-500');
                    this.renderer.addClass(newSpan, 'line-through');
                }
                newSpan.innerText = '  ' + element.line;
                this.renderer.appendChild(this.finalText.nativeElement, newSpan);
            });
        } else {
            newSpan = this.renderer.createElement('span');
            newSpan.innerText = this.newValue === null ? '' : this.newValue;
            this.renderer.appendChild(this.finalText.nativeElement, newSpan);
        }
    }
}
