/**
 * @dev This script initializes strategies in the protocol.
 * @notice Make sure you define initAmount in the strategy config.
 */

import { ZERO_ADDRESS } from '../../../shared/constants'
import { ERC20__factory, Strategy__factory } from '../../../typechain'
import { Strategy } from '../../governance/confTypes'
import { getName, indent } from '../../../shared/helpers'

export const initStrategy = async (
  ownerAcc: any,
  strategy: Strategy,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  console.log()
  console.log(indent(nesting, `INIT_STRATEGY`))
  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []

  const strategyId = strategy.assetId
  const baseId = strategy.base.assetId
  const strategyContract = Strategy__factory.connect(strategy.address, ownerAcc)
  const baseContract = ERC20__factory.connect(strategy.base.address, ownerAcc)

  console.log(
    `${'  '.repeat(nesting)}Transferring ${strategy.initAmount} of ${getName(baseId)} to ${getName(strategyId)}`
  )
  proposal.push({
    target: baseContract.address,
    data: baseContract.interface.encodeFunctionData('transfer', [strategyContract.address, strategy.initAmount!]),
  })
  console.log(indent(nesting, `Initializing ${getName(strategyId)} at ${strategyContract.address}`))
  proposal.push({
    target: strategyContract.address,
    data: strategyContract.interface.encodeFunctionData('init', [ZERO_ADDRESS]), // Burn the strategy tokens minted
  })

  return proposal
}
