export interface ProjectHelpIndexModel extends ProjectHelpPropertyModel {
    children?: ProjectHelpPropertyModel[];
}

export interface ProjectHelpPropertyModel {
    data: ProjectHelpPagePropertyModel;
}

export interface ProjectHelpPagePropertyModel {
    id: number;
    pageId: number;
    pageTitle: string;
    parentPageId: number;
    formattedContent?: string;
    isBookmark?: boolean;
    tags?: string[];
    links?: number[];
}
