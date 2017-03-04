import {
  ObjectApi,
  QueryApi,
  QueryApiResult,
  FieldApi
} from './definitions';

export const getFieldDef = (fieldApi: FieldApi, isRequired = false) =>
  (fieldApi.description ? `# ${fieldApi.description}\n` : '') +
    `  ${fieldApi.apiField}: ${fieldApi.apiType}${isRequired ? '!' : ''}\n`;

export const getField = (objectApi: ObjectApi, apiName) =>
  objectApi.fields.filter(
    (fieldApi: FieldApi) => fieldApi.apiField === 'id'
  )[0];

export const getCreateFields = (objectApi: ObjectApi) =>
  objectApi.fields
    .filter(
      (fieldApi: FieldApi) =>
        fieldApi.requiredForCreate || fieldApi.allowedForUpdate
    )
    .map(
      (fieldApi: FieldApi) => getFieldDef(fieldApi, fieldApi.requiredForCreate)
    )
    .join();

export const isFieldViewable = (fieldApi: FieldApi, context) =>
  fieldApi.allowedForView;

export const getViewableFields = (objectApi: ObjectApi, context) =>
  objectApi.fields
    .filter(
      (fieldApi: FieldApi) => isFieldViewable(fieldApi, context)
    )
    .map((fieldApi: FieldApi) => fieldApi.apiField);

export const getUpdatableFields = (objectApi: ObjectApi) =>
  objectApi.fields
    .filter((fieldApi: FieldApi) => fieldApi.allowedForUpdate)
    .map((fieldApi: FieldApi) => getFieldDef(fieldApi))
    .join();
