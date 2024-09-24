import { Injectable } from '@angular/core';
import { combineLatest, map, Observable, take } from 'rxjs';
import { RawProjectManageTextNodesTransformer } from 'src/app/components/raw-project/manage-textnodes/raw-project-manage-textnodes.transformer';
import { RawProjectTextNodeModel } from '../../../components/raw-project/manage-textnodes/raw-project-textnode.model';
import { RawProjectTextnodeCreateRequestTransformer } from '../../../components/raw-project/manage-textnodes/transformer/raw-project-textnode-create-request.transformer';
import { RawProjectTextnodeCreateResponseTransformer } from '../../../components/raw-project/manage-textnodes/transformer/raw-project-textnode-create-response.transformer';
import { RawProjectTextnodeListResponseTransformer } from '../../../components/raw-project/manage-textnodes/transformer/raw-project-textnode-list-response.transformer';
import { RawProjectTextnodeUpdateRequestTransformer } from '../../../components/raw-project/manage-textnodes/transformer/raw-project-textnode-update-request.transformer';
import { ApiBaseResponseModel } from '../../../shared/models/api-base-response.model';
import { ApiService } from '../api.service';
import { RawProjectService } from './raw-project.service';

@Injectable({
    providedIn: 'root',
})
export class RawProjectTextnodeService {
    private entityUrl = 'raw-project-textnode';

    constructor(
        private readonly api: ApiService,
        private readonly rawProjectTextnodeListResponseTransformer: RawProjectTextnodeListResponseTransformer,
        private readonly rawProjectTextnodeCreateRequestTransformer: RawProjectTextnodeCreateRequestTransformer,
        private readonly rawProjectTextnodeUpdateRequestTransformer: RawProjectTextnodeUpdateRequestTransformer,
        private readonly rawProjectTextnodeCreateResponseTransformer: RawProjectTextnodeCreateResponseTransformer,
        private readonly rawProjectService: RawProjectService,
        private readonly rawProjectManageTextNodesTransformer: RawProjectManageTextNodesTransformer
    ) {}

    getModel(rawProjectId: number) {
        const nodes$ = this.getNodes(rawProjectId);
        const properties$ = this.rawProjectService.getProjectProperties(rawProjectId);

        return combineLatest([nodes$, properties$]).pipe(
            take(1),
            map(([nodes, properties]) => this.rawProjectManageTextNodesTransformer.transform(nodes, properties))
        );
    }

    getNodes(rawProjectId: number): Observable<RawProjectTextNodeModel[]> {
        return this.api
            .getRequest(this.entityUrl + '/list/' + rawProjectId)
            .pipe(
                map((response: ApiBaseResponseModel) =>
                    this.rawProjectTextnodeListResponseTransformer.transform(response?.data)
                )
            );
    }

    updateNode(data: RawProjectTextNodeModel): Observable<number> {
        const request = this.rawProjectTextnodeUpdateRequestTransformer.transform(data);
        return this.api
            .putTypeRequest(this.entityUrl + '/node', request)
            .pipe(
                map((response: ApiBaseResponseModel) =>
                    this.rawProjectTextnodeCreateResponseTransformer.transform(response?.data)
                )
            );
    }

    createNode(data: RawProjectTextNodeModel): Observable<number> {
        const request = this.rawProjectTextnodeCreateRequestTransformer.transform(data);
        return this.api
            .postTypeRequest(this.entityUrl + '/node', request)
            .pipe(
                map((response: ApiBaseResponseModel) =>
                    this.rawProjectTextnodeCreateResponseTransformer.transform(response?.data)
                )
            );
    }

    deleteNode(rawProjectId: number, nodeId: number): Observable<number> {
        return this.api
            .deleteTypeRequest(this.entityUrl + '/node/' + nodeId, {
                rawProjectId: rawProjectId,
            })
            .pipe(
                map((response: ApiBaseResponseModel) =>
                    this.rawProjectTextnodeCreateResponseTransformer.transform(response?.data)
                )
            );
    }

    duplicateNode(nodeId: number): Observable<RawProjectTextNodeModel[]> {
        return this.api
            .getRequest(this.entityUrl + '/duplicate-node/' + nodeId)
            .pipe(
                map((response: ApiBaseResponseModel) =>
                    this.rawProjectTextnodeListResponseTransformer.transform(response?.data)
                )
            );
    }
}
