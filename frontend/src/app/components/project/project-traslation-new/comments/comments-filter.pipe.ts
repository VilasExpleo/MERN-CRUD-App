import { Pipe, PipeTransform } from '@angular/core';
import { CommentModel } from 'src/app/components/project/project-traslation-new/comments/comments.model';

@Pipe({
    name: 'commentFilter',
})
export class FilterPipe implements PipeTransform {
    transform(value: CommentModel[], filterBy: string): CommentModel[] {
        if (filterBy) {
            return value.filter((comment) =>
                comment.comment.toLocaleLowerCase().includes(filterBy.toLocaleLowerCase())
            );
        } else {
            return value;
        }
    }
}
