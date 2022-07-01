import { ApolloServer } from 'apollo-server-express'; // websockets needs express
import express from 'express';
import http from 'http';

import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';
import { typeDefs } from './schema';

import * as data from './data';
import {setup} from './testData'

const getAccountResolver = (parent: any, args: any, context: any, info: any) => {
  console.log('getAccount resolver', {
    parent, args, context, info,
  })
  const account = data.getAccount(args.id)
  const owner = data.getUser(account.ownerId)
  return {
    id: account.id,
    tag: account.tag,
    balance: account.balance,
    status: account.status,
    owner: {
      id: owner.id,
      name: owner.name,
    },
    balanceChanges: data.getBalanceChanges(account.id).map(bc => ({...bc})),
  };
};

const listAccountsResolver = (parent: any, args: any, context: any, info: any) => {
  const accounts = data.listAccounts()
  return accounts.map(a => getAccountResolver({}, {id: a.id}, {}, {}))
}

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

setup()

const main = async () => {
  const pubsub = new PubSub();

  const resolvers = {
    Query: {
      getAccount: getAccountResolver,
      listAccounts: listAccountsResolver,
    },
    Subscription: {
      balanceChangeEvent: {
        subscribe: (parent: any, args: any, context: any, info: any) => {
          console.log({ args, context, info });
          const subject = `BALANCE_CHANGED:${args.accountId}`;
          console.log({ subject });
          return pubsub.asyncIterator([subject]);
        },
      },
    },
  };
  const app = await startApolloServer(typeDefs, resolvers);

  // make something happen
  app.get('/:accountId/:delta/:description', (req: any, res: any) => {
    const { accountId, delta, description } = req.params;
    console.log(`stimulus ${req.params}`)
    const deltaNumber = Number(delta)
    const sequenceNumber = data.balanceChange(accountId, deltaNumber, description)
    pubsub.publish(`BALANCE_CHANGED:${accountId}`, {
      balanceChangeEvent: {
        accountId,
        balanceChange: {
          sequenceNumber,
          delta,
          description,
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
