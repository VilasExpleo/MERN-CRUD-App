import { HelpCreatorResponseModel } from 'src/app/shared/models/help-creator/help-creator-response.model';

export interface HelpIndexModel extends HelpIndexChildPropertyModel {
    children?: HelpIndexChildPropertyModel[];
}

interface HelpIndexChildPropertyModel {
    data: HelpIndexPropertyModel;
}
interface HelpIndexPropertyModel {
    id: number;
    pageId: number;
    parentPageId: number;
    pageTitle: string;
    isChild?: boolean;
    isEditMode?: boolean;
    isSaved?: boolean;
}
export interface HelpIndexNodeModel {
    level: number;
    node: HelpCreatorResponseModel;
    parent: HelpCreatorResponseModel;
    visible: boolean;
}

export interface Column {
    field: string;
    header: string;
}
