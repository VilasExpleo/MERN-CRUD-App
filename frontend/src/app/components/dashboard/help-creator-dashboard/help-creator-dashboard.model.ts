export interface HelpCreatorDashboardPageModel extends HelpCreatorPageContentModel {
    id: number;
    pageId: number;
    parentPageId: number;
    pageTitle: string;
    isBookmark?: boolean;
    userId?: number;
}

export interface HelpCreatorPageContentModel {
    formattedContent?: string;
    tags?: string[];
    links?: number[];
}
