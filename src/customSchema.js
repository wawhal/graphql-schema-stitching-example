const { makeExecutableSchema } = require('graphql-tools');

const getCustomSchema = () => {
  const typeDefs = `
    type rootFieldFromCustomResolver {
      hello: String
    }

    type Query {
      rootFieldFromCustomResolver: rootFieldFromCustomResolver
    }
  `
  ;
  const resolvers = {
    Query: {
      rootFieldFromCustomResolver: (parent, args, context, info) => {
        // custom logic
        // ...
        // return JSON
        return { hello: "world" };
      }
    }
  };
  return makeExecutableSchema({
    typeDefs,
    resolvers
  });
};

const customSchema = getCustomSchema();

module.exports = customSchema;
