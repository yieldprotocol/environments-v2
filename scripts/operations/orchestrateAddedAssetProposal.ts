/**
 * @dev This script adds one or more assets to the protocol.
 *
 * It takes as inputs the governance, protocol, assets and joins json address files.
 * It uses the Wand to:
 *  - Add the asset to Cauldron.
 *  - Deploy a new Join, which gets added to the Ladle, which gets permissions to join and exit.
 * The Timelock and Cloak get ROOT access to the new Join. Root access is NOT removed from the Wand.
 * The Timelock gets access to governance functions in the new Join.
 * A plan is recorded in the Cloak to isolate the Join from the Ladle.
 * It adds to the assets and joins json address files.
 * @notice The assetIds can't be already in use
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, mapToJson, jsonToMap, verify } from '../../shared/helpers'

import { Ladle, Join, Timelock, EmergencyBrake } from '../../typechain'

export const orchestrateAddedAssetProposal = async (
  ownerAcc: any, 
  ladle: Ladle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  assets: [string, string][]
): Promise<Array<{ target: string; data: string }>>  => {
  // Give access to each of the Join governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, Timelock already has ROOT as the deployer
  // Store a plan for isolating Join from Ladle and Witch
  const ROOT = await timelock.ROOT()
  const joins = jsonToMap(fs.readFileSync('./addresses/joins.json', 'utf8')) as Map<string, string>
  let proposal: Array<{ target: string; data: string }> = []

  for (let [assetId, assetAddress] of assets) {
    const join = (await ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc)) as Join
    verify(join.address, [assetAddress])
    console.log(`[${bytesToString(assetId)}Join, : '${join.address}'],`)
    joins.set(assetId, join.address)

    // The joins file can only be updated after the successful execution of the proposal
    fs.writeFileSync('./addresses/joins.json', mapToJson(joins), 'utf8')

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'setFlashFeeFactor(uint256)')],
        timelock.address,
      ]),
    })
    console.log(`join.grantRoles(gov, timelock)`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`join.grantRole(ROOT, cloak)`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
    })
    console.log(`cloak.plan(ladle, join(${bytesToString(assetId)})): ${await cloak.hash(ladle.address, plan)}`)
  }

  return proposal
}
