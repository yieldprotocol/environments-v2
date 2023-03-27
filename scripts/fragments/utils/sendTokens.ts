/**
 * @dev This script transfers specified tokens from the timelock to destination
 */

import { ERC20, ERC20__factory, Timelock } from '../../../typechain'
import { indent } from '../../../shared/helpers'
import { Transfer } from '../../governance/confTypes'

export const sendTokens = async (
  timelock: Timelock,
  transfer: Transfer,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SEND_TOKENS`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  let token: ERC20 | undefined

  token = ERC20__factory.connect(transfer.token.address, timelock.signer)

  proposal.push({
    target: token.address,
    data: token.interface.encodeFunctionData('transfer', [transfer.receiver, transfer.amount]),
  })

  console.log(indent(nesting, `Transferring ${transfer.amount} of ${token.address} to ${token.receiver}`))

  return proposal
}
