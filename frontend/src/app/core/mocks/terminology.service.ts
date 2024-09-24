import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResponseTerm } from 'src/app/shared/models/term.model';

@Injectable({
    providedIn: 'root',
})
export class TerminologyService {
    searchTerms(): Observable<ResponseTerm[]> {
        return of([
            {
                text: 'hello',
                termModelList: [
                    {
                        termText: 'hello',
                    },
                ],
            },
        ]);
    }
}
