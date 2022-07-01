import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Subscription {
    balanceChangeEvent(accountId: ID!): BalanceChangeEvent
    accountUpdated(id: ID!): Account
  }

  enum AccountStatus {
    CREATING
    OPEN
    PAUSED
    CLOSED
  }

  type Query {
    "get account"
    getAccount(id: ID!): Account!
    "list all accounts"
    listAccounts: [Account]!
  }

  "An account"
  type Account {
    "identifier"
    id: ID!
    "user settable identifier"
    tag: String
    status: AccountStatus!
    owner: User
    balance: Int!
    balanceChanges: [BalanceChange!]!
  }

  "A person"
  type User {
    id: ID!
    "civic name"
    name: String!
  }

  type BalanceChangeEvent {
    accountId: ID!
    balanceChange: BalanceChange!
  }

  "balance changes"
  type BalanceChange {
    sequenceNumber: Int!
    delta: Int!
    description: String!
  }
`;
