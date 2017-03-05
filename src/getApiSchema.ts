import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import {
  print,
  parse
} from 'graphql';

import {
  ObjectApis,
  ObjectApi,
  FieldApi,
  QueryApi,
  QueryApiResult
} from './definitions';


export const getFieldDef = (fieldApi: FieldApi, isRequired) =>
  (fieldApi.description ? `# ${fieldApi.description}\n` : '') +
  `  ${fieldApi.apiField}: ${fieldApi.apiType}${isRequired ? '!' : ''}\n`;

const getObjectTypeDefHeader = (apiObject, description) =>
  (description ? `#${description}\n` : '') + `type ${apiObject} {\n`;

const getObjectTypeDefReducer = (accumulator: string, fieldApi: FieldApi) =>
  accumulator += getFieldDef(fieldApi, false);

const getObjectTypeDef = (objectApi: ObjectApi): string => {
  const initialValue =
    getObjectTypeDefHeader(objectApi.apiObject, objectApi.description);
  return objectApi.fields
    .filter((fieldApi: FieldApi) => fieldApi.allowedForView)
    .reduce(getObjectTypeDefReducer, initialValue) + '}\n';
};

const getObjectTypeDefs = (objectApis: ObjectApis) =>
  Object.keys(objectApis)
    .map(key => getObjectTypeDef(objectApis[key]))
    .join();

const getQueryTypeDefFromResult = (queryApiResult: QueryApiResult) =>
  (queryApiResult.description ? `#${queryApiResult.description}\n` : '') +
  queryApiResult.typeDef +
  '\n';

const getQueryTypeDef = (queryApi: QueryApi, objectApi: ObjectApi) =>
  getQueryTypeDefFromResult(queryApi(objectApi));

type ApisType = 'queryApis' | 'mutationApis';

const getQueryTypeDefsForObjectApi =
  (objectApi: ObjectApi, apisType: ApisType) =>
    objectApi[apisType]
      .map(queryApi => getQueryTypeDef(queryApi, objectApi))
      .join('\n');

const getQueryTypeDefsForObject = (objectApis: ObjectApis, apisType: ApisType) =>
  Object.keys(objectApis)
    .map(key => getQueryTypeDefsForObjectApi(objectApis[key], apisType))
    .join();

const getQueryTypeDefs = (objectApis: ObjectApis) =>
  `type Query {\n${getQueryTypeDefsForObject(objectApis, 'queryApis')}}\n`;

const getMutationTypeDefs = (objectApis: ObjectApis) =>
  `type Mutation {\n${getQueryTypeDefsForObject(objectApis, 'mutationApis')}}\n`;

const getQueryResolversForObjectApiReducer = (objectApi: ObjectApi) =>
  (accumulator: {}, queryApi: QueryApi) => {
    const queryApiResult: QueryApiResult = queryApi(objectApi);
    accumulator[queryApiResult.resolverName] = queryApiResult.resolver;
    return accumulator;
  };

const getQueryResolversForObjectApi =
  (objectApi: ObjectApi, apisType: ApisType) => {
    const reducer = getQueryResolversForObjectApiReducer(objectApi);
    return objectApi[apisType].reduce(reducer, {});
  };

const getQueryOrMutationResolversReducer =
  (accumulator, queryResolversForObjectApi) =>
    Object.assign(accumulator, queryResolversForObjectApi);

const getQueryOrMutationResolvers =
  (objectApis: ObjectApis, apisType: ApisType) =>
    Object.keys(objectApis)
      .map(key => getQueryResolversForObjectApi(objectApis[key], apisType))
      .reduce(getQueryOrMutationResolversReducer, {});

const getQueryResolvers = (objectApis: ObjectApis) =>
  getQueryOrMutationResolvers(objectApis, 'queryApis');

const getMutationResolvers = (objectApis: ObjectApis) =>
  getQueryOrMutationResolvers(objectApis, 'mutationApis');

const getTypeDefs = (objectApis: ObjectApis) => {
  const typeDefs =
    getObjectTypeDefs(objectApis) +
    getQueryTypeDefs(objectApis) +
    getMutationTypeDefs(objectApis);
  return typeDefs;
};

const getResolvers = (objectApis) => {
  return {
    Query: getQueryResolvers(objectApis),
    Mutation: getMutationResolvers(objectApis)
  };
};

export const getApiSchema = (objectApis: ObjectApis): GraphQLSchema =>
  makeExecutableSchema({
    typeDefs: getTypeDefs(objectApis),
    resolvers: getResolvers(objectApis)
  });
