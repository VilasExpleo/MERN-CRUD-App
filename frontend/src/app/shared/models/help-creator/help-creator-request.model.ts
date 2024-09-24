export interface HelpCreatorRequestModel extends HelpCreatorPageRequestModel {
    pageTitle: string;
    parentPageId: number;
    userId?: number;
}

export interface HelpCreatorPageRequestModel {
    formattedContent?: string;
    tags?: string[];
    links?: number[];
}

export interface HelpCreatorUpdatePageModel extends HelpCreatorRequestModel, HelpCreatorPageRequestModel {
    pageId?: number;
}

export interface HelpCreatorTemplateModel {
    templateName: string;
    formattedContent: string;
    userId?: number;
}
