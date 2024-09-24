// module.exports = {
//     'src/app/**/*.ts': (files) => `ng lint ${files.map((file) => `--lint-file-patterns=${file}`).join(' ')}`,
// };

// TODO: Improve the file
import micromatch from 'micromatch';

export default {
    '*src/app/**/*.ts': (files) => {
        const match = micromatch.not(
            files,
            // 'src/app/components/project/project-translation/rich-editor/rich-editor.component.ts',
            'src/app/components/project/project-traslation-new/text-editor/rich-editor/rich-editor.component.ts'
            
        );
        return match.length > 0
            ? `ng lint ${match.map((file) => `--lint-file-patterns=${file}`).join(' ')}`
            : `prettier --config .prettierrc --check "./src/**/*.{ts,scss,html}"`;
    },
};
