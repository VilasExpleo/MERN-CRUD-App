/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';
import { GenderVal, SampleTextAttributes } from 'src/Enumerations';
import { LabelModel } from 'src/app/components/dashboard/label-manager/label.model';
import { Brand } from 'src/app/shared/models/brand';
import { TreeNode } from 'src/app/shared/models/translation-manager';
import { PlaceholderTransformer } from '../../../../components/project/project-traslation-new/placeholder-detail-dialog/placeholder.transformer';
import { ApiPlaceholderGetResponseModel } from '../../../../shared/models/placeholder/api-placeholder-get-response.model';
import { PlaceholderDatatypePipe } from '../../../../shared/pipes/placeholder-datatype.pipe';
import { ApiService } from '../../api.service';
import { TabService } from './tab.service';

@Injectable({
    providedIn: 'root',
})
export class TextNodePropertiesService {
    selectedRow: TreeNode;
    propertiesTableColumns = [];
    projectProps: object;
    textNodeProperties = [];
    tableData = [];
    propertyTableMappingObject;
    loading = false;
    selectedRowRaw: TreeNode;

    constructor(
        private apiService: ApiService,
        private placeholderDatatypePipe: PlaceholderDatatypePipe,
        private tabService: TabService
    ) {}

    getProjectParameters() {
        if (localStorage.getItem('projectProps')) {
            const value = localStorage.getItem('projectProps');
            return JSON.parse(value);
        }
    }

    getPropertiesTableColumnsData(row) {
        if (row?.['data']?.['Type']) {
            this.propertiesTableColumns = [{ header: 'Property' }, { header: 'Value' }];
        } else {
            this.propertiesTableColumns = [
                { header: 'Name' },
                { header: 'Project' },
                { header: 'Sample Text Catalog' },
            ];
        }
        return this.propertiesTableColumns;
    }

    getTableData(isTextNode = false) {
        this.tableData = [];
        if (isTextNode) {
            for (const key in this.propertyTableMappingObject) {
                this.tableData.push({
                    name: key,
                    propValue: this.getPropertiesValue(key),
                    mappingValue: this.getMappingValue(key),
                });
            }
        } else {
            this.tableData = [
                {
                    name: 'Name',
                    propValue: this.selectedRow?.['data']?.['context'],
                },
                {
                    name: 'Property Type',
                    propValue: this.selectedRow?.['data']?.['Type'],
                },
                {
                    name: 'Labels',
                    propValue: this.getLabels(this.selectedRow?.['data']?.['labels']),
                },
            ];
        }

        return this.tableData;
    }

    getSelectedRow(data) {
        this.loading = true;
        const props = this.getProjectParameters();
        this.getPropertiesTableColumnsData(data?.treeNode);
        this.selectedRow = data?.treeNode;
        this.selectedRowRaw = data?.treeNode?.data;
        if (this.selectedRow) {
            if (this.selectedRow['data']?.['Type']) {
                this.getTableData(false);
                this.loading = false;
                return;
            } else {
                this.getPropertyTableMappingObject();
            }
        }
        {
            this.getPropertyTableMappingObject();
        }
        const payload: any = !data.payload
            ? {
                  index: data?.treeNode?.data?.array_item_index,
                  node_id: data?.treeNode?.data?.TextNodeId
                      ? data?.treeNode?.data?.TextNodeId.toString()
                      : data?.treeNode?.data?.ID?.toString(),
                  db_text_node_id: data?.treeNode?.data?.db_text_node_id?.toString(),
                  parent_stc_id: data?.treeNode?.data?.parent_stc_id?.toString() || '',
                  project_id: props?.projectId,
                  stc_master_id: data?.treeNode?.data?.stc_master_id?.toString() || '',
                  variant_id: data?.treeNode?.data?.variant_id?.toString(),
                  version_id: props?.version,
                  language_code: data?.treeNode?.data?.TextNodeId
                      ? props?.editorLanguageCode
                          ? props?.editorLanguageCode
                          : props?.reviewerLangCode
                      : data?.treeNode?.data?.context,
              }
            : data.payload;
        const url = `textnode-properties`;
        this.apiService
            .postTypeRequest(url, payload)
            .pipe(catchError(() => of(undefined)))
            .subscribe({
                next: (res) => {
                    if (res?.['status'] === 'OK') {
                        this.loading = false;
                        this.textNodeProperties = res?.['data'];
                        this.tabService.setCountState(res?.['data'][3].count);
                        this.getTableData(true);
                    }
                },
            });
    }

    getPropertyTableMappingObject() {
        this.propertyTableMappingObject = {
            ID: { propertykey: 'objectID', mappingkey: 'id' },
            'Project Name': { propertykey: 'propertyName', mappingkey: '-' },
            Variant: { propertykey: 'variant', mappingkey: '-' },
            'Text Type': { propertykey: 'propertyType', mappingkey: 'type' },
            'List Index': { propertykey: 'listIndex', mappingkey: '-' },
            'Line Break Mode': { propertykey: 'lineBreakMode', mappingkey: '-' },
            'Category name': { propertykey: '', mappingkey: '-' },
            'Max Lines': { propertykey: 'maxLines', mappingkey: '-' },
            'Max Characters': { propertykey: 'maxCharacter', mappingkey: '-' },
            'Max Width': { propertykey: 'maxPixelWidth', mappingkey: '-' },
            Brand: { propertykey: '-', mappingkey: 'brand_id' },
            // eslint-disable-next-line no-constant-condition
            Font: { propertykey: 'fontName' ? 'fontName' : 'font', mappingkey: '-' },
            Numerous: { propertykey: '-', mappingkey: 'numerous' },
            Gender: { propertykey: '-', mappingkey: 'gender' },
            Description: { propertykey: '-', mappingkey: 'description' },
            Placeholders: { propertykey: 'placeholders', mappingkey: 'placeholders' },
            Labels: { propertykey: 'labels', mappingkey: 'labels' },
        };
    }

    getMappingValue(key: string): string {
        const propValue: string =
            this.textNodeProperties[2]['mapped_data']?.find((item) => this.isMappedDataAvailable(key, item))?.[
                this.propertyTableMappingObject[key].mappingkey
            ] || '-';

        switch (key) {
            case SampleTextAttributes.Brand:
                return Brand.getBrand(Number(propValue))?.getLogo();
            case SampleTextAttributes.Gender:
                return GenderVal[propValue] || '-';
            default:
                return propValue;
        }
    }
    isMappedDataAvailable(key: string, item): boolean {
        return (
            (item?.language_id === this.selectedRow?.['data']?.language_id &&
                key !== SampleTextAttributes.Description) ||
            (key === SampleTextAttributes.Description && item.description !== null) ||
            (key === SampleTextAttributes.Brand && item.brand_id !== null) ||
            (key === SampleTextAttributes.ID && item.id !== null) ||
            (key === SampleTextAttributes.Type && item.type !== null)
        );
    }
    getPropertiesValue(key): string[] {
        let ret = [];
        const propValue: string =
            this.textNodeProperties[0] === null
                ? '_'
                : this.textNodeProperties[0]['node_property'][this.propertyTableMappingObject[key].propertykey] || '-';
        switch (key) {
            case 'Labels': {
                ret = this.getLabels(
                    this.textNodeProperties[0]['node_property'][this.propertyTableMappingObject[key].propertykey]
                );
                break;
            }
            case 'Placeholders': {
                const placeholdersResponseModel: ApiPlaceholderGetResponseModel[] =
                    this.textNodeProperties[0] === null
                        ? null
                        : this.textNodeProperties[0]['node_property'][
                              this.propertyTableMappingObject[key].propertykey
                          ] || null;
                const placeholders = PlaceholderTransformer.mapToManyViewModels(placeholdersResponseModel);
                if (placeholders.length) {
                    placeholders.forEach((placeholder) => {
                        let placeholderString: string = placeholder.identifier + ' ';
                        placeholderString += '[';
                        placeholderString += 'Description=' + placeholder.description + ', ';
                        placeholderString +=
                            'Type=' + this.placeholderDatatypePipe.transform(placeholder.dataTypeModelId) + ', ';
                        placeholderString += 'Worst case value=' + placeholder.longestCaseValue + ', ';
                        placeholderString += 'Extra Line=' + placeholder.extraLine;
                        placeholderString += ']';
                        ret.push(placeholderString);
                    });
                } else {
                    ret.push('-');
                }
                break;
            }
            default: {
                ret.push(propValue);
            }
        }

        return ret;
    }
    private getLabels(labels: LabelModel[]) {
        return labels ?? [];
    }
}
