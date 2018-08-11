const fetch = require('node-fetch');
const { mergeSchemas } = require('graphql-tools');
const getHasuraSchema = require('./hasuraSchema.js');
const customSchema = require('./customSchema.js');
const { ApolloServer } = require('apollo-server');

const startServer = async () => {
  const hasuraSchema = await getHasuraSchema();
  const schema = mergeSchemas({
    schemas: [
      hasuraSchema,
      customSchema
    ]
  });
  const server = new ApolloServer({
    schema
  });
  server.listen().then(({ url }) => {
    console.log(`Server running at ${url}`);
  });
};

try {
  startServer();
} catch (e) {
  console.error(e);
}
