/**
 * @dev This script adds one or more series to the protocol.
 * Assumes that the necessary assets have been added to the protocol as bases or ilks as needed, in a previous transaction.
 * Adding bases or ilks as part of this same proposal will fail.
 *
 * The Cloak gets ROOT access to the new FYToken. Root access is removed from the deployer.
 * The Timelock gets access to governance functions in the new FYToken.
 * A plan is recorded in the Cloak to isolate the FYToken from the Ladle.
 */

import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'

import { Cauldron, Ladle, Join, FYToken, Pool, Timelock, EmergencyBrake } from '../../../typechain'

export const addSeriesProposal = async (
  ownerAcc: any,
  deployer: string,
  cauldron: Cauldron,
  ladle: Ladle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  newFYTokens: Map<string, string>, // seriesId, fyTokenAddress
  newPools: Map<string, string>,    // seriesId, poolAddress
): Promise<Array<{ target: string; data: string }>>  => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, fyTokenAddress] of newFYTokens) {
    console.log(`Using fyToken at ${fyTokenAddress} for ${seriesId}`)
    const fyToken = (await ethers.getContractAt('FYToken', fyTokenAddress, ownerAcc)) as FYToken
    
    const baseId = await fyToken.underlyingId()

    const poolAddress = newPools.get(seriesId)
    if (poolAddress === undefined) throw `Pool for ${seriesId} not found`
    else console.log(`Using pool at ${poolAddress} for ${seriesId}`)
    const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool

    const joinAddress = await ladle.joins(baseId) as string
    if (joinAddress === undefined) throw `Join for ${baseId} not found`
    else console.log(`Using join at ${joinAddress} for ${baseId}`)
    const join = (await ethers.getContractAt('Join', await ladle.joins(baseId) as string, ownerAcc)) as Join

    const chiOracleAddress = await cauldron.lendingOracles(baseId) as string
    if (chiOracleAddress === undefined) throw `${baseId} not a base in the Cauldron`
    else console.log(`Using oracle at ${chiOracleAddress} for ${baseId}`)

    // Give access to each of the fyToken governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, Timelock already has ROOT as the deployer
    // Store a plan for isolating FYToken from Ladle and Base Join

    // Add fyToken/series to the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('addSeries', [
        seriesId,
        baseId,
        fyToken.address
      ]),
    })
    console.log(`Adding ${seriesId} for ${baseId} using ${fyToken.address}`)

    // Register pool in Ladle
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addPool', [
        seriesId,
        pool.address
      ]),
    })
    console.log(`Adding ${seriesId} pool to Ladle using ${pool.address}`)

    // Allow the fyToken to pull from the base join for redemption, and to push to mint with underlying
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [
          id(join.interface, 'join(address,uint128)'),
          id(join.interface, 'exit(address,uint128)'),
        ],
        fyToken.address,
      ]),
    })
    console.log(`join.grantRoles(join/exit, fyToken)`)

    // Allow the ladle to issue and cancel fyToken
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [
          id(fyToken.interface, 'mint(address,uint256)'),
          id(fyToken.interface, 'burn(address,uint256)'),
        ],
        ladle.address,
      ]),
    })
    console.log(`fyToken.grantRoles(mint/burn, ladle)`)

    // Orchestrate Timelock for the fyToken governance functions
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [
          id(fyToken.interface, 'point(bytes32,address)'),
          id(fyToken.interface, 'setFlashFeeFactor(uint256)'),
        ],
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
        signatures: [
          id(fyToken.interface, 'mint(address,uint256)'),
          id(fyToken.interface, 'burn(address,uint256)')
        ],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address, ladlePlan]),
    })
    console.log(`cloak.plan(ladle, fyToken(${bytesToString(seriesId)})): ${await cloak.hash(ladle.address, ladlePlan)}`)

    // Register emergency plan to disconnect fyToken from join
    const joinPlan = [
      {
        contact: join.address,
        signatures: [
          id(join.interface, 'join(address,uint128)'),
          id(join.interface, 'exit(address,uint128)')
        ],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [fyToken.address, joinPlan]),
    })
    console.log(`cloak.plan(fyToken, join(${bytesToString(baseId)})): ${await cloak.hash(fyToken.address, joinPlan)}`)
  }

  return proposal
}
