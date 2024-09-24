export interface ImportLanguageModel {
    title: string;
    versions: ProjectVersionModel[];
}

export interface ProjectVersionModel {
    projectId: number;
    versionId: number;
    displayVersionId: number;
}
