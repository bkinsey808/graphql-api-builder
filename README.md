# GraphQL API Biulder

Allows you to build your apollo graphql api in an organized and structured way.

Exact design is still under construction, currently looks like this:


~~~~
export const User: ObjectApi = {
  apiObject: 'User',
  dbObject: 'app_user',
  description: 'people who use our system',
  queryApis: [
    getIndexQuery,
    getDetailQuery
  ],
  mutationApis: [
    getCreateQuery,
    getDeleteQuery,
    getUpdateQuery
  ],
  fields: [{
    apiField: 'id',
    primary: true,
    apiType: 'Int',
    description: 'unique identifier',
    allowedForView: true
  }, {
    apiField: 'username',
    apiType: 'String',
    description: 'public identifier',
    requiredForCreate: true,
    allowedForUpdate: true,
    allowedForView: true
  }],
  getResolver
};
~~~~
