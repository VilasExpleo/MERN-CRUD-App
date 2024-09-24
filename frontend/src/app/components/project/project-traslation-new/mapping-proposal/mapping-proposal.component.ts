import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MappingService } from 'src/app/core/services/mapping/mapping.service';

@Component({
    selector: 'app-mapping-proposal',
    templateUrl: './mapping-proposal.component.html',
    styleUrls: ['./mapping-proposal.component.scss'],
})
export class MappingProposalComponent implements OnInit {
    columsMappingProp = [];
    constructor(public mappingService: MappingService, private router: Router) {}

    ngOnInit(): void {
        this.columsMappingProp = this.mappingService.getMappingProposalsTabelColumns();
    }
    sampleTextCatalogPage(stcId) {
        const navigationExtras: any = { Id: stcId };
        const url = this.router.serializeUrl(this.router.createUrlTree(['main/sample-text-catalog', navigationExtras]));
        window.open(url, '_blank');
    }
}
