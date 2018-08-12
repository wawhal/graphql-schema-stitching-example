const {makeExecutableSchema} = require('graphql-tools');

/* In this file, we're creating a custom GraphQL schema
 * with new root level fields and resolvers.
 */

const myCustomSchema = () => {

  // Define custom types here
  const typeDefs = `
    type myCustomRootField{
      hello: String
    }

    type Query {
      myCustomRootField: myCustomRootField
    }
  `;

  // Define custom resolvers for the types defined
  // above
  const myCustomResolvers = {
    Query: {
      // Add a custom resolver
      myCustomRootField: (parent, args, context, info) => {
        // custom logic that returns JSON per the requested query
        return { hello: "world" };
      }
    }
  };

  return makeExecutableSchema({
    typeDefs,
    myCustomResolvers
  });
};

const customSchema = myCustomSchema();

module.exports = customSchema;
