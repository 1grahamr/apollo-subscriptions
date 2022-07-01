import {addAccount, addUser, balanceChange} from './data'

const add = (userId: string, userName: string, accountId: string, tag: string): void => {
    addUser(userId, userName)
    addAccount(accountId, tag, userId)
}

export const setup = () => {
    add('1001', 'Dave', '8001', 'current account')
    balanceChange('8001', 100, 'inital deposit')
    balanceChange('8001', 20, 'spend')

    add('1002', 'Martin', '8002', 'savings')
    balanceChange('8002', 500, 'initial deposit')

    add('1003', 'Alan', '8003', 'new synth')
    balanceChange('8003', 200, 'initial deposit')
    balanceChange('8003', 500, 'saving1')
    balanceChange('8003', 400, 'saving2')

    add('1004', 'Fletch', '8004', 'toast hawaii')
    balanceChange('8004', 500, 'initial deposit')
    balanceChange('8004', 10, 'toast1')
    balanceChange('8004', 10, 'toast2')
    balanceChange('8004', 10, 'toast3')
}
