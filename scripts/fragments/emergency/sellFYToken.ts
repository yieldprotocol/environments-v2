/**
 * @dev This script mints fyToken without backing it with collateral and sells it for the underlying asset.
 */
import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import { getName, indent } from '../../../shared/helpers'
import { Ladle, Pool__factory } from '../../../typechain'

export const sellFYToken = async (
  ladle: Ladle,
  seriesId: string,
  receiver: string,
  minReceived: BigNumber,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `MINT_AND_SELL_FY_TOKEN`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  const pool = Pool__factory.connect(await ladle.pools(seriesId), ethers.provider)

  // Sell fyToken for underlying
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('sellFYToken', [receiver, minReceived]),
  })
  console.log(indent(nesting, `Sold ${getName(seriesId)}`))

  return proposal
}
