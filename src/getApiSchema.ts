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

const getObjectTypeDef = (objectApi: ObjectApi): string =>
  objectApi.fields.reduce(
    (accumulator: string, fieldApi: FieldApi) =>
      accumulator += getFieldDef(fieldApi, false),
    getObjectTypeDefHeader(objectApi.apiObject, objectApi.description)
  ) + '}\n';

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

const getQueryTypeDefs = (objectApis: ObjectApis) =>
  `type Query {\n` +
    Object.keys(objectApis)
      .map(
        key => getQueryTypeDefsForObjectApi(objectApis[key], 'queryApis')
      )
      .join() +
    `}\n`;

const getMutationTypeDefs = (objectApis: ObjectApis) =>
  `type Mutation {\n` +
    Object.keys(objectApis)
      .map(
        key => getQueryTypeDefsForObjectApi(objectApis[key], 'mutationApis')
      )
      .join() +
    `}\n`;

const getQueryResolversForObjectApi =
  (objectApi: ObjectApi, apisType: ApisType) =>
    objectApi[apisType].reduce(
      (accumulator: {}, queryApi: QueryApi) => {
        const queryApiResult: QueryApiResult = queryApi(objectApi);
        accumulator[queryApiResult.resolverName] = queryApiResult.resolver;
        return accumulator;
      },
      {}
    );

const getQueryOrMutationResolvers =
  (objectApis: ObjectApis, apisType: ApisType) =>
    Object.keys(objectApis)
      .map(key => getQueryResolversForObjectApi(objectApis[key], apisType))
      .reduce(
        (accumulator, queryResolversForObjectApi) =>
          Object.assign(accumulator, queryResolversForObjectApi),
        {}
      );

const getQueryResolvers = (objectApis: ObjectApis) =>
  getQueryOrMutationResolvers(objectApis, 'queryApis');

const getMutationResolvers = (objectApis: ObjectApis) =>
  getQueryOrMutationResolvers(objectApis, 'mutationApis');

const getTypeDefs = (objectApis: ObjectApis) =>
  getObjectTypeDefs(objectApis) +
    getQueryTypeDefs(objectApis) +
    getMutationTypeDefs(objectApis);

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
