/**
 * @dev This script makes one or more assets into bases.
 *
 * It takes as inputs the governance and protocol json address files.
 * It uses the Wand to add the relevant rate source to Cauldron, and to permission the Witch to liquidate debt.
 * It verifies that the oracle supplied can return rate and chi for the new bases.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { id } from '@yield-protocol/utils-v2'
import { bytesToBytes32, bytesToString, getContract } from '../../../shared/helpers'
import { CHI, DAI, RATE, USDC } from '../../../shared/constants'

import { IOracle } from '../../../typechain'

import { proposeApproveExecute } from '../../../shared/helpers'
import { DeployedContext } from '../../../core/contexts'


(async () => {
  const ctx = await DeployedContext.create();

  const newAssets = [DAI, USDC];
  const oracleName = "accumulatorOracle";

    // Build the proposal
  // Store a plan in the cloak to isolate the join from the Witch
  const proposal: Array<{ target: string; data: string }> = []
  for (let assetId of newAssets) {
    const join = await ctx.getJoinForAsset(assetId);
    
    // Test that the sources for rate and chi have been set. Peek will fail with 'Source not found' if they have not.
    const rateChiOracle = await getContract<IOracle>(ctx.owner, "IOracle", ctx.protocol.get(oracleName));

    console.log(
      `Current RATE for ${bytesToString(assetId)}: ${
        (await rateChiOracle.peek(bytesToBytes32(assetId), bytesToBytes32(RATE), 0))[0]
      }`
    )
    console.log(
      `Current CHI for ${bytesToString(assetId)}: ${
        (await rateChiOracle.peek(bytesToBytes32(assetId), bytesToBytes32(CHI), 0))[0]
      }`
    )

    proposal.push({
      target: ctx.wand.address,
      data: ctx.wand.interface.encodeFunctionData('makeBase', [assetId, rateChiOracle.address]),
    })
    console.log(`[Asset: ${bytesToString(assetId)} made into base using ${rateChiOracle.address}],`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)')],
      },
    ]

    proposal.push({
      target: ctx.cloak.address,
      data: ctx.cloak.interface.encodeFunctionData('plan', [ctx.witch.address, plan]),
    })
    console.log(
      `cloak.plan(witch, join(${bytesToString(assetId)})): ${await ctx.cloak.hash(ctx.witch.address, plan)}`
    )
  }

  await proposeApproveExecute(ctx.timelock, proposal, ctx.governance.get('multisig') as string);
})()
