export type AccountStatus = 'CREATING' | 'OPEN' | 'PAUSED' | 'CLOSED'

export type Account = {
    id: string,
    tag: string,
    status: AccountStatus,
    ownerId: string,
    balance: number,
    nextSequence: number,
}

export type User = {
  id: string,
  name: string,
}

export type BalanceChange = {
    accountId: string,
    sequenceNumber: number,
    delta: number,
    description: string,
}

const balanceChanges: BalanceChange[] = [];
const accounts: Account[] = [];
const users: User[] = [];

export const addUser = (id: string, name: string) => {
  users.push({ id, name });
};

export const addAccount = (id: string, tag: string, ownerId: string) => {
  accounts.push({
    id, tag, ownerId, status: 'OPEN', balance: 0, nextSequence: 1,
  });
};

export const balanceChange = (accountId: string, delta: number, description: string) => {
  const account = accounts.find((a) => accountId === a.id);
  if (!account) {
    throw new Error(`unknown account ${accountId}`);
  }
  balanceChanges.push({
    accountId, sequenceNumber: account.nextSequence, delta, description,
  });
  account.nextSequence++
  account.balance += delta
};

export const listAccounts = (): Account[] => {
  return accounts
}
export const getAccount = (id: string): Account => {
  const account = accounts.find(a => a.id === id)
  if (!account) {
    throw new Error(`account id ${id} not found`)
  }
  return account
}

export const getUser = (id: string): User => {
  const user = users.find(u => u.id === id)
  if (!user) {
    throw new Error(`user ${id} not found`)
  }
  return user
}

export const getBalanceChanges = (accountId: string): BalanceChange[] => {
  return balanceChanges.filter(bc => bc.accountId === accountId)
}