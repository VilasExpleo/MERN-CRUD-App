import { Injectable } from '@angular/core';
import { ProjectFlow } from './editable-properties.enum';
import { Brand, EditablePropertiesModel, ProjectFlowType, ProjectType } from './editable-properties.model';

@Injectable({
    providedIn: 'root',
})
export class EditablePropertiesTransformer {
    transform(properties, properties2, properties3, types, brands, user): EditablePropertiesModel {
        return {
            projectName: this.getProjectName(properties, properties2, properties3) ?? properties?.projectName ?? '',
            brand: this.getBrand(brands, user),
            projectType:
                this.getProjectType(properties, properties2, properties3, types) ?? this.getType(types, properties),
            deliveryDate: this.getDeliveryDate(properties, properties3),
            description:
                this.getDescription(properties, properties2, properties3) ?? properties?.projectDescription ?? '',
            placeholders: this.getPlaceholders(properties, properties2, properties3) ?? properties?.placeholders ?? [],
            brands: this.getBrands(brands),
            projectTypes: this.getTypes(types),
            projectFlow: properties?.projectFlow as ProjectFlowType,
            isProjectUpdateInProgress: properties3?.isProjectUpdateInProgress,
        } as EditablePropertiesModel;
    }

    getTypes(projectTypes): ProjectType[] {
        return projectTypes.map((projectType) => ({
            id: projectType.type_id,
            type: projectType.type,
        }));
    }

    // TODO: Remove these methods while using the single state for both create and update
    private getDeliveryDate(properties, properties3) {
        if (!properties3?.due_date) {
            return '';
        }

        if (properties3.due_date.indexOf('1900') > -1) {
            return '';
        }

        return properties?.projectFlow === ProjectFlow.properties ? new Date(properties3.due_date) : '';
    }

    private getProjectName(properties, properties2, properties3) {
        return properties?.projectFlow === ProjectFlow.create ? properties2?.projectName : properties3?.title;
    }

    private getDescription(properties, properties2, properties3) {
        return properties?.projectFlow === ProjectFlow.create
            ? properties2?.projectDescription
            : properties3?.description;
    }

    private getPlaceholders(properties, properties2, properties3) {
        return properties?.projectFlow === ProjectFlow.create
            ? properties2?.mainDefinitionPlaceHolder
            : properties3?.placeholder;
    }

    private getProjectType(properties, properties2, properties3, types) {
        return properties?.projectFlow === ProjectFlow.create
            ? this.getType(types, properties2?.project_type)
            : this.getType(types, properties3?.project_type);
    }

    private getBrands(brands): Brand[] {
        return brands.map((brand) => ({
            id: brand.brand_id,
            name: brand.brand_name,
        }));
    }

    private getBrand(brands, user) {
        if (!brands || !Array.isArray(brands) || brands.length === 0) {
            return undefined;
        }

        if (!user || !user.brand_id) {
            return undefined;
        }

        const brand = brands.find((b) => b.brand_id === user.brand_id);

        if (!brand) {
            return undefined;
        }

        return {
            id: brand.brand_id,
            name: brand.brand_name,
        };
    }

    private getType(types, selectedType) {
        if (!types || !Array.isArray(types) || types.length === 0) {
            return undefined;
        }

        if (!selectedType) {
            return undefined;
        }

        // TODO: remove this once we have one data model for both create and properties
        const typeId = selectedType.id ?? selectedType.type;

        const foundType = types.find((type) => type.type_id === typeId);
        if (!foundType) {
            return undefined;
        }

        return {
            id: foundType.type_id,
            type: foundType.type,
        };
    }
}
