const { makeExecutableSchema, makeRemoteExecutableSchema, introspectSchema, mergeSchemas } = require('graphql-tools');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');

const HASURA_GRAPHQL_ENDPOINT = `https://bazookaand.herokuapp.com/v1alpha1/graphql`;

const getRemoteHasuraSchema = async () => {
  const link = new HttpLink({
    uri: HASURA_GRAPHQL_ENDPOINT,
    fetch
  });
  const hasuraRemoteSchema = await introspectSchema(link);
  const executableHasuraSchema = makeRemoteExecutableSchema({
    schema: hasuraRemoteSchema,
    link
  });
  return executableHasuraSchema;
};

module.exports = getRemoteHasuraSchema;
