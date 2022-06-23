import { ApolloServer } from 'apollo-server'
import {typeDefs} from './schema'

const resolvers = {}

const getAccount = (parent: any, args: any, context: any, info: any) => {
    console.log(`getAccount resolver`, {parent, args, context, info})
    return {
        id: "unknown",
        tag: args.tag,
        balance: 0,
    }
}

const server = new ApolloServer({
    typeDefs,

    resolvers: {
        Query: {
          getAccount,
        },
      },

  csrfPrevention: true,  // highly recommended

  cache: 'bounded',
//   playground: {
//     settings: {
//       'editor.theme': 'light',
//     },
//     tabs: [
//       {
//       },
//     ],
//   },
});


server.listen().then(() => {
    console.log(`
      🚀  Server is running!
      🔉  Listening on port 4000
      📭  Query at https://studio.apollographql.com/dev
  `);
  });
  