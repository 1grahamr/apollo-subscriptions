import { ApolloServer } from 'apollo-server-express'; // websockets needs express
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import http from 'http';
import {typeDefs} from './schema'

const getAccount = (parent: any, args: any, context: any, info: any) => {
    console.log(`getAccount resolver`, {parent, args, context, info})
    return {
        id: "unknown",
        tag: args.tag,
        balance: 100,
    }
}

async function startApolloServer(typeDefs: any, resolvers: any) {
    const app = express()
    const httpServer = http.createServer(app)
  
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      csrfPrevention: true,
      cache: 'bounded',
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    })

    await server.start()

    server.applyMiddleware({ app })

    await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve))

    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  }

const main = async () => {
    const resolvers = {
            Query: {
                getAccount,
            },
      }
    await startApolloServer(typeDefs, resolvers )
}

main()
.catch((e) => {
    throw e
})

