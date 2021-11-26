/**
 * @dev This script initializes pools in the protocol.
 *
 * It takes as inputs the governance and pools json address files.
 */

 import { BigNumber } from 'ethers'

import { getContract, stringToBytes6 } from '../../../../shared/helpers'
import { ZERO_ADDRESS } from '../../../../shared/constants'

import { ERC20Mock } from '../../../../typechain'

import { DeployedContext } from '../../../core/contexts'


(async () => {
  const ctx = await DeployedContext.create();
  
  const poolsInit: Array<[string]> = [
    // [seriesId]
    [stringToBytes6('0104')],
    [stringToBytes6('0105')],
    [stringToBytes6('0204')],
    [stringToBytes6('0205')],
  ]

  const proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId] of poolsInit) {
    const pool = await ctx.getPoolForSeries(seriesId);
    const base = await getContract<ERC20Mock>(ctx.owner, "ERC20Mock", await pool.base());
    const baseUnit: BigNumber = BigNumber.from(10).pow(await base.decimals())

    // Supply pool with a hundred tokens of underlying for initialization
    proposal.push({
      target: base.address,
      data: base.interface.encodeFunctionData('transfer', [pool.address, baseUnit.mul(100)]),
    })

    // Initialize pool
    proposal.push({
      target: pool.address,
      data: pool.interface.encodeFunctionData('mint', [ZERO_ADDRESS, ZERO_ADDRESS, 0, 0]), // Send the LP tokens to the zero address, maxRatio is set to zero, purposefully reverting this if someone has already initialized the pool
    })
    console.log(`Initalizing ${await pool.symbol()} at ${pool.address}`)
  }

  await ctx.proposeApproveExecute(proposal, true);
})()
