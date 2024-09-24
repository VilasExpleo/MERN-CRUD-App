import { ApiBaseResponseModel } from '../../../../shared/models/api-base-response.model';
import { SpellcheckTransformer } from 'src/app/components/settings/about-hmil/spellcheck/spellcheck.transformer';
import { catchError, of, map } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api.service';

@Injectable({
    providedIn: 'root',
})
export class SpellcheckService {
    constructor(private apiService: ApiService, private spellcheckTransformer: SpellcheckTransformer) {}

    getSpellcheckVersion() {
        return this.apiService.getRequest(`spell-check/version`).pipe(
            catchError(() => of(undefined)),
            map((response: ApiBaseResponseModel) => this.spellcheckTransformer.transform(response?.data))
        );
    }
}
