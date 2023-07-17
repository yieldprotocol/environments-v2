/**
 * @dev This script uses a Trader contract and flash loans to mint fyToken and sell them to a pool.
 * Effectively, we pay a small price for moving underlying from the pools to the joins
 */

import { Trader } from '../../../typechain'
import { indent } from '../../../shared/helpers'
import { Transfer } from '../../governance/confTypes'

export const sellFYTokens = async (
  trader: Trader,
  transfer: Transfer,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SELL_FYTOKENS`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: trader.address,
    data: trader.interface.encodeFunctionData('sellFYToken', [transfer.receiver, transfer.amount, 0]),
  })

  console.log(indent(nesting, `Sold ${transfer.amount} fyToken to pool at ${transfer.receiver}`))

  return proposal
}
