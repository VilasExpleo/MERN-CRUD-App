import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    set(localVariableName: string, data: any) {
        localStorage.setItem(localVariableName, data);
    }

    get(localVariableName: string) {
        return localStorage.getItem(localVariableName);
    }

    clear() {
        localStorage.clear();
    }

    removeKeys(keys: string[]) {
        keys.forEach((key: string) => localStorage.removeItem(key));
    }
}
