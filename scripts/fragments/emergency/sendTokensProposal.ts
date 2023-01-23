/**
 * @dev This script transfers specified tokens from the timelock to destination
 */

import { BigNumber } from 'ethers'
import { ERC20, ERC20__factory, Timelock } from '../../../typechain'

export const sendTokensProposal = async (
  timelock: Timelock,
  data: Array<[string, string, BigNumber]>, // [token address, destination address, amount]
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log(`\n${'  '.repeat(nesting)}SEND_TOKENS`)
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  let token: ERC20 | undefined

  for (const [tokenAddr, destAddr, amount] of data) {
    if (tokenAddr !== token?.address) {
      token = ERC20__factory.connect(tokenAddr, timelock.signer)
    }

    proposal.push({
      target: token.address,
      data: token.interface.encodeFunctionData('transfer', [destAddr, amount]),
    })

    console.log(`${'  '.repeat(nesting)}Transferring ${amount.toString()} of ${token.address} to ${destAddr}`)
  }

  return proposal
}
