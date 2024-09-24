import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { LeftSideBarComponent } from './components/left-sidebar/left-sidebar.component';
import { TranslationStatisticsComponent } from './components/translation-statistics/translation-statistics.component';
import { RichTextEditorComponent } from './rich-text-editor.component';

@NgModule({
    declarations: [RichTextEditorComponent, LeftSideBarComponent, TranslationStatisticsComponent],
    imports: [
        CommonModule,
        FormsModule,
        QuillModule.forRoot({
            placeholder: '',

            scrollingContainer: '.container',
            theme: 'bubble',
        }),
    ],

    exports: [RichTextEditorComponent],
})
export class RichTextEditorModule {}
