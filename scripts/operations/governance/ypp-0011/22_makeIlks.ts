/**
 * @dev This script makes one or more assets into ilks for one or more bases.
 *
 * It takes as inputs the governance and protocol address files.
 * It uses the Wand to set the spot oracle, debt limits, and allow the Witch to liquidate collateral.
 * A plan is recorded in the Cloak to isolate the Join from the Witch.
 */

import { id } from '@yield-protocol/utils-v2'
import { bytesToBytes32, bytesToString, } from '../../../../shared/helpers'
import { ETH, DAI, WAD, USDC } from '../../../../shared/constants'

import { IOracle, Join } from '../../../../typechain'

import { proposeApproveExecute } from '../../../../shared/helpers'
import { DeployedContext } from '../../../core/contexts'


(async () => {
  const ctx = await DeployedContext.create();

  const oracleName = "accumulatorOracle";

  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
  const newIlks: Array<[string, string, string, number, number, number, number, number]> = [
    [DAI, ETH, oracleName, 1400000, 714000, 500000, 1, 18],
    [DAI, DAI, oracleName, 1000000, 1000000, 10000000, 0, 18], // Constant 1, no dust
    [DAI, USDC, oracleName, 1330000, 751000, 100000, 1, 18], // Via USD
    [USDC, ETH, oracleName, 1400000, 714000, 500000, 1, 6],
    [USDC, DAI, oracleName, 1330000, 751000, 100000, 1, 6], // Via USD
    [USDC, USDC, oracleName, 1000000, 1000000, 10000000, 0, 6], // Constant 1, no dust
  ]

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = []
  const plans: Array<string> = new Array() // Existing plans in the cloak
  for (let [baseId, ilkId, oracleName, ratio, invRatio, line, dust, dec] of newIlks) {
    const join = await ctx.getJoinForAsset(ilkId);//(await ethers.getContractAt('Join', joins.get(ilkId) as string, ownerAcc)) as Join

    const spotOracle = ctx.chainlinkUSDMultiOracle;

    console.log(`Looking for ${bytesToString(baseId)}/${bytesToString(ilkId)} at ${ctx.protocol.get(oracleName) as string}`)
    // console.log(`Source for ${bytesToString(baseId)}/ETH: ${await spotOracle.sources(baseId, ETH)}`)
    // console.log(`Source for ${bytesToString(ilkId)}/ETH: ${await spotOracle.sources(ilkId, ETH)}`)
    console.log(
      `Current SPOT for ${bytesToString(baseId)}/${bytesToString(ilkId)}: ${(await spotOracle.callStatic.get(bytesToBytes32(baseId), bytesToBytes32(ilkId), WAD))[0]
      }`
    )

    if (!plans.includes(ilkId) && !((await ctx.witch.limits(ilkId)).line.toString() !== '0')) {
      proposal.push({
        target: ctx.witch.address,
        data: ctx.witch.interface.encodeFunctionData('setIlk', [
          ilkId,
          60 * 60,
          invRatio,
          line,
          dust,
          dec, // ilkId, duration, initialOffer, line, dust, dec
        ]),
      })
      console.log(`[Asset: ${bytesToString(ilkId)} set as ilk on witch at ${ctx.witch.address}],`)
    }

    proposal.push({
      target: ctx.wand.address,
      data: ctx.wand.interface.encodeFunctionData('makeIlk', [baseId, ilkId, spotOracle.address, ratio, line, dust, dec]),
    })
    console.log(`[Asset: ${bytesToString(ilkId)} made into ilk for ${bytesToString(baseId)}],`)

    if (!plans.includes(ilkId) && !((await ctx.witch.limits(ilkId)).line.toString() !== '0')) {
      const plan = [
        {
          contact: join.address,
          signatures: [id(join.interface, 'exit(address,uint128)')],
        },
      ]

      proposal.push({
        target: ctx.cloak.address,
        data: ctx.cloak.interface.encodeFunctionData('plan', [ctx.witch.address, plan]),
      })
      console.log(
        `cloak.plan(witch, join(${bytesToString(ilkId)})): ${await ctx.cloak.hash(ctx.witch.address, plan)}`
      )

      plans.push(ilkId)
    }
  }


  await proposeApproveExecute(ctx.timelock, proposal, ctx.governance.get('multisig') as string);
})()
