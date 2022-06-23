import { ApolloServer } from 'apollo-server-express'; // websockets needs express
import express from 'express';
import http from 'http';

import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import { typeDefs } from './schema';

const getAccount = (parent: any, args: any, context: any, info: any) => {
  console.log('getAccount resolver', {
    parent, args, context, info,
  });
  return {
    id: 'unknown',
    tag: args.tag,
    balance: 100,
  };
};

async function startApolloServer(typeDefs: any, resolvers: any): Promise<express.Express> {
  const app = express();

  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const wsServer = new WebSocketServer({
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql',
  });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  server.applyMiddleware({ app });

  // eslint-disable-next-line no-promise-executor-return
  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));

  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  return app;
}

let globalCount = 0;

const main = async () => {
  const pubsub = new PubSub();

  const resolvers = {
    Query: {
      getAccount,
    },
    Subscription: {
      balanceChangeEvent: {
        subscribe: (parent: any, args: any, context: any, info: any) => {
          console.log({ args, context, info });
          const subject = `BALANCE_CHANGED:${args.ownerId}`;
          console.log({ subject });
          return pubsub.asyncIterator([subject]);
        },
      },
    },
  };
  const app = await startApolloServer(typeDefs, resolvers);

  // make something happen
  app.get('/push/:id', (req: any, res: any) => {
    const { id } = req.params;
    console.log(`stimulus id=${id}`);
    pubsub.publish(`BALANCE_CHANGED:${id}`, {
      balanceChangeEvent: {
        ownerId: '1234',
        balanceChange: {
          sequenceNumber: globalCount++,
          delta: 1,
        },
      },
    });
    res.send('ACK');
  });
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://studio.apollographql.com');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
};

main()
  .catch((e) => {
    throw e;
  });
