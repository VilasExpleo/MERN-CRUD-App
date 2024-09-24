/* eslint-disable no-prototype-builtins */
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Roles, TableHeaders, TextnodeType } from 'src/Enumerations';
import { ApiService } from '../../api.service';
import { UserService } from '../../user/user.service';
import { PlaceholderService } from './placeholder.service';

@Injectable({
    providedIn: 'root',
})
export class TableService {
    private readonly _header = new BehaviorSubject<any>({});
    readonly header$ = this._header.asObservable();
    editorLanguage: string;
    constructor(
        private date: DatePipe,
        private apiService: ApiService,
        private placeholderService: PlaceholderService,
        private userService: UserService
    ) {}
    get header() {
        return this._header.getValue();
    }
    private set header(val) {
        this._header.next(val);
    }
    getFilterType(key) {
        switch (typeof key) {
            case 'string':
                return 'text';
            case 'number':
                return 'numeric';
            case 'object':
                return 'object';
            default:
                return 'date';
        }
    }
    getTabelHeader(apiData) {
        const headers = [];
        const langList = [];
        this.editorLanguage = this.getProjectParameters()?.editorLanguageCode;
        for (const key in apiData) {
            if (apiData.hasOwnProperty(key)) {
                if (key === 'language_data') {
                    apiData[key].map((item) => {
                        item.language_props.map((langProp) => {
                            let displayFlag = false;
                            if (
                                this.userService.getUser().role === Roles['translator'] ||
                                this.userService.getUser().role === Roles['proofreader'] ||
                                (this.userService.getUser().role === Roles['reviewer'] &&
                                    (langProp?.prop_name === 'Proofread Status' ||
                                        langProp?.prop_name === 'Proofread Comment' ||
                                        langProp?.prop_name === 'Review Status' ||
                                        langProp?.prop_name === 'Review Comment' ||
                                        langProp?.prop_name === 'ScreenReview Status' ||
                                        langProp?.prop_name === 'ScreenReview Comment' ||
                                        langProp?.prop_name === 'State'))
                            ) {
                                displayFlag = true;
                            } else if (this.userService.getUser().role === Roles['editor']) {
                                if (item.language_code === this.editorLanguage) {
                                    displayFlag = true;
                                }
                            }
                            const headerObj = {
                                field: langProp.prop_name,
                                header: item.language_code + ' ' + langProp.prop_name,
                                filterType: this.getFilterType(langProp.value),
                                display: displayFlag,
                                langCode: item.language_code,
                                langId: item.language_id,
                            };

                            headers.push(headerObj);
                        });
                        langList.push({ header: item?.language_code });
                    });
                } else {
                    const herderName = key
                        .split('_')
                        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
                        .join(' ');
                    const displayFlag = [
                        'sequence_no',
                        'property_name',
                        'line_break_mode',
                        'source_text',
                        'font',
                    ].includes(key);

                    const headerObj = {
                        field: key,
                        header: herderName,
                        filterType: this.getFilterType(apiData[key]),
                        display: displayFlag,
                        langCode: '',
                        langId: '',
                    };
                    headers.push(headerObj);
                }
            }
        }
        this.header = { projectTabelColumns: headers, langList: langList };
    }
    getTabelData(apiData): Observable<any> {
        return of(apiData);
    }
    getTabelFilterObject(event): Observable<any> {
        // Check for filters on the table
        const filArray = [];
        const filterObject = event.filters;
        const entries = Object.entries(filterObject);
        entries.forEach(([key, value]) => {
            if (Array.isArray(value)) {
                key = JSON.parse(key);
                value.forEach((item) => {
                    const dataObj = {
                        operator: item.operator,
                        column_name: key['field'],
                        language_code: key['langCode'],
                        value: key['field'].includes('Last change')
                            ? this.date.transform(item.value, 'yyyy-MM-dd')
                            : value,
                        condition: item.matchMode,
                    };
                    if (item.value !== null) filArray.push(dataObj);
                });
            }
        });
        return of(filArray);
    }
    getTdValue(rowdata, headerProp): string {
        let value = '';
        if (typeof headerProp === 'object') {
            if (rowdata[headerProp.field]) {
                if (headerProp.field === 'text_node_type') {
                    if (rowdata[headerProp.field] === '_') {
                        value = 'StandardText';
                    } else {
                        value = rowdata['text_node_type'];
                    }
                } else {
                    value = rowdata[headerProp.field];
                }
            } else {
                const language_code = headerProp.langCode;
                const langWiseData = rowdata['language_data']?.find((item) => item.language_code === language_code);
                if (langWiseData) {
                    const translationText = langWiseData['language_props'].find(
                        (item) => language_code + ' ' + item.prop_name === headerProp.header
                    )['value'];
                    if (this.isTextHasPlaceholder(headerProp.header, language_code, rowdata?.placeholders)) {
                        value =
                            this.placeholderService.getTranslationTextWithPlaceholderWorstCaseValue(
                                rowdata,
                                null,
                                translationText,
                                'table'
                            )?.translationText ?? '';
                    } else {
                        value = translationText ?? '';
                    }
                }
            }
        } else if (typeof headerProp === 'string') {
            if (headerProp === 'property_name') {
                if (rowdata['text_node_type'] === '_') {
                    value = 'StandardText';
                } else {
                    if (TextnodeType[rowdata['text_node_type']] !== undefined) {
                        value = rowdata['text_node_type'];
                    } else {
                        value = 'user';
                    }
                }
            } else if (headerProp === 'mapped') {
                value = rowdata['mapped'];
            }
        }
        return value;
    }
    getSortObject(event): any {
        let sortObj: any = {};
        if (event.sortField) {
            const sortOrder = event.sortOrder === -1 ? 'desc' : 'asc';
            sortObj = { column_name: event.sortField, order: sortOrder };
        }
        return sortObj;
    }
    conditionWiseHeaderHideShow(response, source) {
        source?.map((item) => {
            item.display = response?.find((sc) => sc.field === item?.field && sc.langCode === item?.langCode);
            return item;
        });
    }
    getTotalNode(payload, url) {
        return this.apiService.postTypeRequest(url, payload);
    }
    getProjectParameters() {
        if (localStorage.getItem('projectProps')) {
            return JSON.parse(localStorage.getItem('projectProps'));
        }
    }

    private isTextHasPlaceholder(header: string, language_code: string, placeholders = []): boolean {
        return placeholders?.length > 0 && header === language_code + ' ' + TableHeaders.Text;
    }
}
