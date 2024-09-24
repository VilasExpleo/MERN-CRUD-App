import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CalculateInputParams, CalculationObject } from 'src/app/shared/models/length-calculator';
import { ProjectTranslationService } from '../services/project/project-translation/project-translation.service';

@Injectable({
    providedIn: 'root',
})
export class LcManagerService {
    constructor(private objProjectTranslationService: ProjectTranslationService) {}
    //TODO
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    calculate(texts: string[], options: CalculateInputParams): Observable<CalculationObject[]> {
        return of(
            texts.map((text) => {
                const unresolved = [];
                this.objProjectTranslationService?.unresolvedSymbols?.forEach((symbol) => {
                    const index = text.indexOf(symbol);
                    if (index !== -1) {
                        unresolved.push(index);
                    }
                });
                return {
                    width: 7 * text.length,
                    text,
                    unresolved,
                };
            })
        );
    }
}
