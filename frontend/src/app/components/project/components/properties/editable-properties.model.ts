export interface EditablePropertiesModel {
    projectName: string;
    brand: Brand;
    projectType: ProjectType;
    placeholders: PlaceholderModel[];
    brands: Brand[];
    projectTypes: ProjectType[];
    description?: string;
    deliveryDate?: Date;
    projectFlow?: ProjectFlowType;
    isProjectUpdateInProgress?: boolean;
}

export interface Brand {
    id?: number;
    name: string;
}

export interface ProjectType {
    id?: number;
    type: string;
}

export interface PlaceholderModel {
    symbol: string;
    isActive: boolean;
    canDelete: boolean;
    id?: number;
}

export type ProjectFlowType = 'create' | 'properties';

export const initialEditableProperties: EditablePropertiesModel = {
    projectName: ' ',
    brand: {
        name: '',
    },
    projectType: {
        type: '',
    },
    placeholders: [
        {
            id: 1,
            symbol: '$n',
            isActive: true,
            canDelete: true,
        },
    ],
    brands: [],
    projectTypes: [],
    description: '',
};
