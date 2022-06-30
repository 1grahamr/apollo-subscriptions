import {
  ApolloClient, gql, HttpLink, InMemoryCache,
} from '@apollo/client/core';

import fetch from 'cross-fetch';

export const GET_ACCOUNT = gql`
  query GetAccount {
    getAccount(tag: "graham") {
      tag
      balance
    }
  }
`;

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
  getAccount();
};

main()
  .catch((e) => {
    throw e;
  });
