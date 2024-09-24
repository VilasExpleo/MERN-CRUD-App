export interface HelpCreatorResponseModel extends HelpCreatorPageModel {
    children?: HelpCreatorPageModel[];
}

export interface HelpCreatorPageModel {
    data: HelpCenterPagePropertyModel;
}

export interface HelpCenterPagePropertyModel extends HelpCenterPagePropertyFlagModel {
    pageId: number;
    parentPageId: number;
    pageTitle: string;
}

export interface HelpCenterPagePropertyFlagModel {
    id: number;
    isChild?: boolean;
    isEditMode?: boolean;
    isSaved?: boolean;
    isBookmark?: boolean;
}

export interface HelpCreatorLinksModel {
    id: number;
    linkName: string;
    linkId: number;
    helpPageId: number;
}
export interface HelpTemplateOptionModel {
    links: HelpCreatorLinksModel[];
    templates: HelpTemplateResponseModel[];
}

export interface HelpTemplateResponseModel {
    templateId: number;
    templateName: string;
    formattedContent: string;
    userId: number;
}
