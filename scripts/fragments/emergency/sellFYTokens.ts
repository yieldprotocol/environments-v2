/**
 * @dev This script sells fyToken for the underlying asset.
 */
import { BigNumber } from 'ethers'
import { indent } from '../../../shared/helpers'
import { Pool } from '../../../typechain'

export const sellFYTokens = async (
  pool: Pool,
  receiver: string,
  minReceived: BigNumber,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `SELL_FY_TOKEN`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  // Sell fyToken for underlying
  proposal.push({
    target: pool.address,
    data: pool.interface.encodeFunctionData('sellFYToken', [receiver, minReceived]),
  })
  console.log(indent(nesting, `Sold ${await pool.name()}`))

  return proposal
}
