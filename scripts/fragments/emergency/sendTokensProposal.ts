/**
 * @dev This script transfers specified tokens from the timelock to destination
 */

import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { ERC20, ERC20__factory, Timelock } from '../../../typechain'

export const sendTokensProposal = async (
  timelock: Timelock,
  data: Array<[string, string, BigNumber]> // [token address, destination address, amount]
): Promise<Array<{ target: string; data: string }>> => {
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  let token: ERC20 | undefined
  let decimals: number | undefined

  for (const [tokenAddr, destAddr, amount] of data) {
    if (tokenAddr !== token?.address) {
      token = ERC20__factory.connect(tokenAddr, timelock.signer)
      decimals = await token.decimals()
    }

    proposal.push({
      target: token.address,
      data: token.interface.encodeFunctionData('transfer', [destAddr, amount]),
    })

    console.log(`Transferring ${ethers.utils.formatUnits(amount, decimals)} of ${token.address} to ${destAddr}`)
  }

  return proposal
}
