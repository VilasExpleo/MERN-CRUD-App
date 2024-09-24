import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RTETranslationLengthCalculationService {
    newlinePositionsCounterMap = new Map<number, number>();
    /**
     * Method is responsible to return line break positions. Method is waiting until new line positions reaches to counter 5
     * New line counter is used to ease the word line break in smooth way.
     * @param newlineIndices
     * @param originalText
     * @returns word line break positions
     */
    filterWordLineBreakServerResponse(newlineIndices: number[], originalText: string): number[] {
        if (newlineIndices.length === 0) {
            return [];
        }

        this.updateNewLinePositionCounter(newlineIndices);
        this.setNewlinePositionCounter(newlineIndices);

        return newlineIndices.filter(
            (n) =>
                this.newlinePositionsCounterMap.get(n) >= 5 &&
                originalText.charAt(n - 1) !== '\n' &&
                originalText.charAt(n) !== '\n'
        );
    }

    private updateNewLinePositionCounter(newlineIndices: number[]) {
        const newlineIndicesMap = new Set(newlineIndices);
        new Map(this.newlinePositionsCounterMap).forEach((value, key) => {
            if (!newlineIndicesMap.has(key)) {
                if (value > 1) {
                    this.newlinePositionsCounterMap.set(key, value - 1);
                } else {
                    this.newlinePositionsCounterMap.delete(key);
                }
            }
        });
    }

    private setNewlinePositionCounter(newlineIndices: number[]) {
        for (const newlineIndex of newlineIndices) {
            // Increase the counter of new line position until reaches 5
            if (this.newlinePositionsCounterMap.get(newlineIndex) < 5) {
                this.newlinePositionsCounterMap.set(
                    newlineIndex,
                    this.newlinePositionsCounterMap.get(newlineIndex) + 1
                );
            } else {
                // Set initial value of the new line positions against all line break positions
                this.newlinePositionsCounterMap.set(newlineIndex, 1);
            }
        }
    }
}
