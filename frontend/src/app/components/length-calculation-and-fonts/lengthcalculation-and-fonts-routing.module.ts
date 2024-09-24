import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LengthCalculationAndFontsComponent } from './length-calculation-and-fonts.component';

const routes: Routes = [
    {
        path: '',
        component: LengthCalculationAndFontsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class LengthcalculationAndFontsRoutingModule {}
