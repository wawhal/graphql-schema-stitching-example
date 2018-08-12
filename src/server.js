const fetch = require('node-fetch');

const { mergeSchemas } = require('graphql-tools');
const { ApolloServer } = require('apollo-server');

const getHasuraSchema = require('./hasuraSchema.js');
const customSchema = require('./customSchema.js');

const startServer = async () => {
  const hasuraSchema = await getHasuraSchema();

  // Merge the hasura schema and a custom schema
  const schema = mergeSchemas({
    schemas: [
      hasuraSchema,
      customSchema
    ]
  });

  const server = new ApolloServer({
    schema,
    cors: true
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
