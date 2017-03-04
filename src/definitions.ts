export interface ObjectApis {
   [key: string]: ObjectApi;
};

export interface ObjectApi {
  getResolver: Function;
  apiObject: string;
  dbObject: string;
  description?: string;
  queryApis?: Array<QueryApi>;
  mutationApis?: Array<QueryApi>;
  fields: Array<FieldApi>;
};

export interface FieldApi {
  apiField: string;
  apiType: string;
  description?: string;
  primary?: boolean;
  requiredForCreate?: boolean;
  allowedForUpdate?: boolean | Authorize;
  allowedForView?: boolean | Authorize;
}

export type Authorize = (context: any) => boolean | Promise<boolean>;

export type Resolver = (root, args, context) => any;

export type QueryApi = (objectApi: ObjectApi) => QueryApiResult;

export interface QueryApiResult {
  typeDef: string;
  description: string;
  resolverName: string;
  resolver: Resolver;
}
