const { makeExecutableSchema, makeRemoteExecutableSchema, introspectSchema, mergeSchemas } = require('graphql-tools');
const { HttpLink } = require('apollo-link-http');
const fetch = require('node-fetch');

const HASURA_GRAPHQL_ENDPOINT = process.env.HASURA_GRAPHQL_ENDPOINT || `https://bazookaand.herokuapp.com/v1alpha1/graphql`;
const METAWEATHER_API_URL = "https://www.metaweather.com/api/location/";

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

const createWeatherSchema = () => {
  const customWeatherTypeDefs = `
    type CityWeather {
      temp: String
      min_temp: String
      max_temp: String
      city_name: String!
      applicable_date: String!
    }

    type Query {
      cityWeather(city_name: String! applicable_date: String): CityWeather
    }
  `;
  const getWeather = (data) => {
    return fetch(METAWEATHER_API_URL + data.woeid)
      .then(response => response.json());
  };
  const getWoeid = (place) => {
    return fetch(`${METAWEATHER_API_URL}search/?query=${place}`)
      .then(response => response.json())
      .then(jsonResponse => jsonResponse[0]);
  };
  const customWeatherResolvers = {
    Query: {
      cityWeather: (root, args, context, info) => {
        return getWoeid(args.city_name).then( function(response) {
          if (!response) {
            return null;
          }
          return getWeather(response).then( function(weather) {
            if (!weather) {
              return null;
            }

            let consolidated_weather = weather.consolidated_weather;
            // check for args applicable_date to apply filter
            if (args.applicable_date) {
              consolidated_weather = consolidated_weather.find(item => item.applicable_date === args.applicable_date);
            } else {
              consolidated_weather = consolidated_weather[0];
            }

            const respObj = {
              temp: consolidated_weather.the_temp.toString(),
              min_temp: consolidated_weather.min_temp.toString(),
              max_temp: consolidated_weather.max_temp.toString(),
              city_name: weather.title,
              applicable_date: consolidated_weather.applicable_date
            };

            return respObj;
          });
        });
      }
    }
  };
  return makeExecutableSchema({
    typeDefs: customWeatherTypeDefs,
    resolvers: customWeatherResolvers
  });
};

const getHasuraSchema = async () => {
  const hasuraSchema = await getRemoteHasuraSchema();
  const weatherSchema = createWeatherSchema();
  const schemaExtensionResolvers = {
    user: {
      weatherFromRESTApi: {
        resolve(parent, args, context, info) {
          return info.mergeInfo.delegateToSchema({
            schema: weatherSchema,
            operation: 'query',
            fieldName: 'cityWeather',
            args: {
              city_name: parent.city
            },
            context,
            info
          });
        }
      },
      stringFromCustomResolver: () => 'some random text string'
    }
  };
  const typeExtensions = `
    extend type user {
      weatherFromRESTApi: CityWeather,
      stringFromCustomResolver: String
    }
  `;
  return mergeSchemas({
    schemas: [
      hasuraSchema,
      weatherSchema,
      typeExtensions,
    ],
    resolvers: schemaExtensionResolvers
  });
};

module.exports = getHasuraSchema;
