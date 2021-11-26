/**
 * @dev This script replaces one or more chi data sources in the CompoundMultiOracle.
 *
 * It takes as inputs the governance, protocol and chiSources json address files.
 * It rewrites the chiSources json address file.
 */

import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, verify,  } from '../../../../shared/helpers'
import { DAI, ETH, USDC } from '../../../../shared/constants'

import { ERC20Mock } from '../../../../typechain'

import { proposeApproveExecute } from '../../../../shared/helpers'
import { DeployedContext } from '../../../core/contexts'


(async () => {
  const ctx = await DeployedContext.create();

  const newAssets = [DAI, USDC, ETH];

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []
  for (let assetId of newAssets) {
    const assetAddress = await ctx.assets.get(assetId)!;
    const asset = (await ethers.getContractAt('ERC20Mock', assetAddress as string, ctx.owner)) as unknown as ERC20Mock
    console.log(`Using ${await asset.name()} at ${assetAddress}`)

    proposal.push({
      target: ctx.wand.address,
      data: ctx.wand.interface.encodeFunctionData('addAsset', [assetId, assetAddress]),
    })
    console.log(`[Asset: ${bytesToString(assetId)}: ${assetAddress}],`)
  }
  await proposeApproveExecute(ctx.timelock, proposal, ctx.governance.get('multisig') as string);
  await proposeApproveExecute(ctx.timelock, proposal, ctx.governance.get('multisig') as string);
  await proposeApproveExecute(ctx.timelock, proposal, ctx.governance.get('multisig') as string);

  // Give access to each of the Join governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, Timelock already has ROOT as the deployer
  // Store a plan for isolating Join from Ladle and Witch
  proposal = [];

  for (let assetId of newAssets) {
    const assetAddress = await ctx.assets.get(assetId)!;

    const join = await ctx.getJoinForAsset(assetId);
    verify(join.address, [assetAddress]);
    console.log(`[${bytesToString(assetId)}Join, : '${join.address}'],`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'setFlashFeeFactor(uint256)')],
        ctx.timelock.address,
      ]),
    })
    console.log(`join.grantRoles(gov, timelock)`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [ctx.ROOT, ctx.cloak.address]),
    })
    console.log(`join.grantRole(ROOT, cloak)`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    proposal.push({
      target: ctx.cloak.address,
      data: ctx.cloak.interface.encodeFunctionData('plan', [ctx.ladle.address, plan]),
    })
    console.log(`cloak.plan(ladle, join(${bytesToString(assetId)})): ${await ctx.cloak.hash(ctx.ladle.address, plan)}`)
  }
  await ctx.proposeApproveExecute(proposal, true);
})()
