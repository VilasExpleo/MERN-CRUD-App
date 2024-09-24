import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SampleTextCatalogComponent } from './sample-text-catalog.component';

const routes: Routes = [
    {
        path: '',
        component: SampleTextCatalogComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SampleTextCatalogRoutingModule {}
