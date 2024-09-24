import { Injectable } from '@angular/core';
import { FontPackageModel } from '../manage-raw-project-state.model';

@Injectable({
    providedIn: 'root',
})
export class ManageRawProjectSystemFontTransformer {
    transform(systemFonts): FontPackageModel[] {
        return systemFonts.map((font) => ({
            id: font.id,
            name: font.font_packagename,
            isDefault: false,
            isSelected: false,
        }));
    }
}
