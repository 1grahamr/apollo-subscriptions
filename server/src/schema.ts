import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    "get account"
    getAccount(tag: String!): Account!
  }

  "An account"
  type Account {
    id: ID!
    "identifier"
    tag: String
    "user settable identifier"
    owner: User
    "The number of modules this track contains"
    modulesCount: Int
    "1=mono 2=stereo"
    channels: Int!
    balance: Int!
    balanceChanges: [Int!]!
  }

  "A person"
  type User {
    id: ID!
    "civic name"
    name: String!
  }

  "balance changes"
  type BalanceChange {
    sequenceNumber: Int!
    delta: Int!
  }
`;
