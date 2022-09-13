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
import { ethers } from 'hardhat'
import { ZERO_ADDRESS } from '../../../../shared/constants'
import { bytesToString } from '../../../../shared/helpers'
import { Cauldron, EmergencyBrake, FYToken, Ladle, Pool } from '../../../../typechain'

export const addSeriesProposal = async (
  ownerAcc: any,
  cauldron: Cauldron,
  ladle: Ladle,
  cloak: EmergencyBrake,
  newFYTokens: Map<string, string>, // seriesId, fyTokenAddress
  newPools: Map<string, string> // seriesId, poolAddress
): Promise<Array<{ target: string; data: string }>> => {
  let proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, fyTokenAddress] of newFYTokens) {
    console.log(`Using fyToken at ${fyTokenAddress} for ${seriesId}`)
    const fyToken = (await ethers.getContractAt('FYToken', fyTokenAddress, ownerAcc)) as FYToken

    const baseId = await fyToken.underlyingId()

    const poolAddress = newPools.get(seriesId)
    if (poolAddress === undefined || poolAddress === ZERO_ADDRESS) throw `Pool for ${seriesId} not found`
    else console.log(`Using pool at ${poolAddress} for ${seriesId}`)
    const pool = (await ethers.getContractAt('Pool', poolAddress, ownerAcc)) as Pool

    // Give access to each of the fyToken governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, Timelock already has ROOT as the deployer
    // Store a plan for isolating FYToken from Ladle and Base Join

    // Add fyToken/series to the Cauldron
    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('addSeries', [seriesId, baseId, fyToken.address]),
    })
    console.log(`Adding ${seriesId} for ${baseId} using ${fyToken.address}`)

    // Register pool in Ladle
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addPool', [seriesId, pool.address]),
    })
    console.log(`Adding ${seriesId} pool to Ladle using ${pool.address}`)

    // ==== Orchestrate fyToken ====

    // Allow the ladle to issue and cancel fyToken
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
        ladle.address,
      ]),
    })
    console.log(`fyToken.grantRoles(mint/burn, ladle)`)

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
      console.log(
        `cloak.plan(ladle, fyToken(${bytesToString(seriesId)})): ${await cloak.hash(ladle.address, ladlePlan)}`
      )
    }
  }
  return proposal
}
