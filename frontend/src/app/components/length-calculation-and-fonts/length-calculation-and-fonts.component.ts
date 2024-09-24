import { Component, OnInit } from '@angular/core';
import { LengthCalculationService } from 'src/app/core/services/length-calculation-and-fonts/length-calculation.service';

@Component({
    selector: 'app-length-calculation-and-fonts',
    templateUrl: './length-calculation-and-fonts.component.html',
})
export class LengthCalculationAndFontsComponent implements OnInit {
    activeIndex = 0;
    constructor(public lengthCalculationService: LengthCalculationService) {}

    ngOnInit(): void {
        this.lengthCalculationService.onLoad(0);
    }

    onLoad(event) {
        this.lengthCalculationService.onLoad(event);
    }
}
