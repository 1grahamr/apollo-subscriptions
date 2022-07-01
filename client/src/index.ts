import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import {
  ApolloClient, gql, HttpLink, InMemoryCache,
} from '@apollo/client/core';
import fetch from 'cross-fetch';
import WebSocket from 'ws';

const wsLink = new GraphQLWsLink(createClient({
  webSocketImpl: WebSocket,
  url: 'ws://localhost:4000/graphql',
  connectionParams: {
    authToken: 'auth token goes here',
  },
}));

export const GET_ACCOUNT = gql`
  query GetAccount {
    getAccount(tag: "graham") {
      tag
      balance
    }
  }
`;

export const SUBSCRIBE_BALANCE_CHANGES = gql`
subscription balanceChangeEvent($ownerId: ID!)  {
    balanceChangeEvent(ownerId: $ownerId) {
        ownerId
        balanceChange {
            sequenceNumber
            delta
        }
    }
  } 
`;

export const subscribe = async (): Promise<void> => {
  const handleBalanceChangeEvent = (data: any) => {
    console.log('event:', data);
  };
  const client = new ApolloClient({
    link: wsLink,
    cache: new InMemoryCache(),
  });

  client.subscribe(
    {
      query: SUBSCRIBE_BALANCE_CHANGES,
      variables: { ownerId: '1234' },
    },
  ).subscribe(handleBalanceChangeEvent);
};

export const getAccount = async (): Promise<any> => {
  const client = new ApolloClient({
    link: new HttpLink({
      uri: 'http://localhost:4000/graphql',
      fetch,
      headers: { Authorization: 'Bearer PJ-ddHe2tqKUuvZNhAaQ1MbgSfvbby6E-eQ8twZynvI' },
    }),
    cache: new InMemoryCache(),
  });

  return new Promise((resolve) => {
    client.query<any>({
      query: GET_ACCOUNT,
      variables: {
      },
    })
      .then((result) => {
        console.log(JSON.stringify(result));
        const cmsAccount: any = result?.data;

        resolve(cmsAccount);
      });
  });
};

const main = async () => {
  await getAccount();
  await subscribe();
};

main()
  .catch((e) => {
    throw e;
  });
