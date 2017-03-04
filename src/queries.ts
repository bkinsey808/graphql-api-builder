import * as pluralize from 'pluralize';
import * as lcfirst from 'lcfirst';

import {
  ObjectApi,
  QueryApi,
  QueryApiResult
} from './definitions';
import {
  getUpdatableFields,
  getCreateFields,
  getFieldDef,
  getField
} from './utils';


export const getIndexQuery: QueryApi =
  (objectApi: ObjectApi): QueryApiResult => {
    const resolverName = lcfirst(pluralize(objectApi.apiObject));
    return {
      resolverName,
      typeDef: `${resolverName}: [${objectApi.apiObject}]`,
      description: `the index query`,
      resolver: objectApi.getResolver('index', objectApi)
    };
  };

export const getDetailQuery: QueryApi =
  (objectApi: ObjectApi): QueryApiResult => {
    const resolverName = lcfirst(objectApi.apiObject);
    const idField = getFieldDef(getField(objectApi, 'id'), true);
    return {
      resolverName,
      typeDef: `${resolverName}(\n${idField}): ${objectApi.apiObject}`,
      description: 'the detail query',
      resolver: objectApi.getResolver('detail', objectApi)
    };
  };

export const getCreateQuery: QueryApi =
  (objectApi: ObjectApi): QueryApiResult => {
    const resolverName = 'create' + objectApi.apiObject;
    const createFields = getCreateFields(objectApi);
    const typeDef = `${resolverName}(\n${createFields}\n): Boolean`;
    return {
      resolverName,
      typeDef,
      description: 'the create query',
      resolver: objectApi.getResolver('create', objectApi)
    };
  };

export const getUpdateQuery: QueryApi =
  (objectApi: ObjectApi): QueryApiResult => {
    const resolverName = 'update' + objectApi.apiObject;
    const idField = getFieldDef(getField(objectApi, 'id'), true);
    const updatableFields = getUpdatableFields(objectApi);
    const typeDef = `${resolverName}(\n
        ${idField}${updatableFields}
      ): Boolean`;
    return {
      resolverName,
      typeDef,
      description: 'the update query',
      resolver: objectApi.getResolver('update', objectApi)
    };
  };

export const getDeleteQuery: QueryApi =
  (objectApi: ObjectApi): QueryApiResult => {
    const resolverName = 'delete' + objectApi.apiObject;
    const idField = getFieldDef(getField(objectApi, 'id'), true);
    const typeDef = `${resolverName}(\n${idField}\n): Boolean`;
    return {
      resolverName,
      typeDef,
      description: 'the delete query',
      resolver: objectApi.getResolver('delete', objectApi)
    };
  };
