# Apollo subscriptions workbench

Provides schema defined in server/src/schema.ts using a corpus of test data.

## Server

```
cd server
nvm use
npm install
npm run start
```

Playground is available at http://localhost:4000/graphql

### Example

```
query ListAccounts {
  listAccounts {
    id
    tag
    balance
  }
}
```

```
query GetAccount($accountId: ID!) {
  getAccount(id: $accountId) {
    id
    tag
    balance
    balanceChanges {
      delta
      description
    }
  }
}
```

### Generate an event:

Generate a transaction for account 1234 of 19.99 with description 'TestEvent':

```
curl localhost:4000/8004/199/TEST_TXN
```

## Client

Subscribes for event, outputting them to the terminal

```
cd client
nvm use
npm install
npm run
```

### Update schema

```
npm run schema:download
```
