/**
 * @dev This script adds one or more series to the protocol.
 * Assumes that the necessary assets have been added to the protocol as bases or ilks as needed, in a previous transaction.
 * Adding bases or ilks as part of this same proposal will fail.
 *
 * The Cloak gets ROOT access to the new FYToken. Root access is removed from the deployer.
 * The Timelock gets access to governance functions in the new FYToken.
 * A plan is recorded in the Cloak to isolate the FYToken from the Ladle.
 */

import { id } from '@yield-protocol/utils-v2'
import { ROOT, ZERO_ADDRESS } from '../../../shared/constants'
import { getName } from '../../../shared/helpers'

import {
  Timelock,
  OldEmergencyBrake,
  Cauldron,
  Ladle,
  Witch,
  Join__factory,
  FYToken__factory,
  Pool__factory,
} from '../../../typechain'

export const addSeriesProposal = async (
  ownerAcc: any,
  deployer: string,
  cauldron: Cauldron,
  ladle: Ladle,
  witch: Witch,
  timelock: Timelock,
  cloak: OldEmergencyBrake,
  joins: Map<string, string>, // assetId, joinAddress
  newFYTokens: Map<string, string>, // seriesId, fyTokenAddress
  newPools: Map<string, string> // seriesId, poolAddress
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, fyTokenAddress] of newFYTokens) {
    console.log(`Using fyToken at ${fyTokenAddress} for ${getName(seriesId)}`)
    const fyToken = FYToken__factory.connect(fyTokenAddress, ownerAcc)

    const baseId = await fyToken.underlyingId()

    const poolAddress = newPools.getOrThrow(seriesId)
    if (poolAddress === undefined || poolAddress === ZERO_ADDRESS) throw `Pool for ${seriesId} not found`
    else console.log(`Using pool at ${poolAddress} for ${getName(seriesId)}`)
    const pool = Pool__factory.connect(poolAddress, ownerAcc)

    const join = Join__factory.connect(joins.get(baseId) as string, ownerAcc)
    console.log(`Using join at ${join.address} for ${getName(baseId)}`)

    // Add fyToken/series to the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('addSeries', [seriesId, baseId, fyToken.address]),
    })
    console.log(`Adding ${getName(seriesId)} for ${getName(baseId)} using ${fyToken.address}`)

    // Register pool in Ladle
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addPool', [seriesId, pool.address]),
    })
    console.log(`Adding ${getName(seriesId)} pool to Ladle using ${pool.address}`)

    // ==== Orchestrate fyToken ====

    // Allow the fyToken to pull from the base join for redemption, and to push to mint with underlying
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
        fyToken.address,
      ]),
    })
    console.log(`join.grantRoles(join/exit, fyToken)`)

    // Allow the ladle to issue and cancel fyToken
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
        ladle.address,
      ]),
    })
    console.log(`fyToken.grantRoles(mint/burn, ladle)`)

    // Allow Witch to burn fyTokens
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRole', [
        id(fyToken.interface, 'burn(address,uint256)'),
        witch.address,
      ]),
    })

    // Allow to revoke the above permission on emergencies
    const plan = [
      {
        contact: fyToken.address,
        signatures: [id(fyToken.interface, 'burn(address,uint256)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(witch.address, plan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [witch.address, plan]),
      })
      console.log(`cloak.plan(witch, burn(${getName(seriesId)})): ${await cloak.hash(witch.address, plan)}`)
    }

    // Orchestrate Timelock for the fyToken governance functions
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [id(fyToken.interface, 'point(bytes32,address)'), id(fyToken.interface, 'setFlashFeeFactor(uint256)')],
        timelock.address,
      ]),
    })
    console.log(`fyToken.grantRoles(gov, timelock)`)

    // Remove ROOT from deployer
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('revokeRole', [ROOT, deployer]),
    })
    console.log(`fyToken.revokeRole(ROOT, deployer)`)

    // Grant ROOT to cloak
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`fyToken.grantRole(ROOT, cloak)`)

    // Register emergency plan to disconnect fyToken from ladle
    const ladlePlan = [
      {
        contact: fyToken.address,
        signatures: [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(ladle.address, ladlePlan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [ladle.address, ladlePlan]),
      })
      console.log(`cloak.plan(ladle, fyToken(${getName(seriesId)})): ${await cloak.hash(ladle.address, ladlePlan)}`)
    }

    // Register emergency plan to disconnect fyToken from join
    const joinPlan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(fyToken.address, joinPlan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [fyToken.address, joinPlan]),
      })
      console.log(`cloak.plan(fyToken, join(${getName(baseId)})): ${await cloak.hash(fyToken.address, joinPlan)}`)
    }
  }

  return proposal
}
