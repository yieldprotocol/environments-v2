/**
 * @dev This script orchestrates one or more series in the protocol.
 *
 * It takes as inputs the governance and protocol json address files.
 * The Timelock and Cloak get ROOT access to the new FYToken. Root access is NOT removed from the Wand.
 * The Timelock gets access to governance functions in the new FYToken.
 * A plan is recorded in the Cloak to isolate the FYToken from the Ladle.
 */

import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { bytesToString, verify } from '../../../shared/helpers'

import { Cauldron, Ladle, Join, FYToken, Pool, Timelock, EmergencyBrake } from '../../../typechain'

export const orchestrateSeriesProposal = async (
  ownerAcc: any,
  cauldron: Cauldron,
  ladle: Ladle,
  timelock: Timelock,
  cloak: EmergencyBrake,
  newSeries: Array<[string, string, number, string[], string, string]>
): Promise<Array<{ target: string; data: string }>>  => {

  const ROOT = await timelock.ROOT()

  let proposal: Array<{ target: string; data: string }> = []

  // Each series costs 10M gas to deploy, so there is no bundling of several series in a single proposal
  for (let [seriesId, , , , , ] of newSeries) {

    // The fyToken and pools files can only be updated after the successful execution of the proposal
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      (await cauldron.series(seriesId)).fyToken,
      ownerAcc
    )) as FYToken

    console.log(`${await fyToken.symbol()}, '${fyToken.address}'`)
    verify(
      fyToken.address,
      [
        await fyToken.underlyingId(),
        await fyToken.oracle(),
        await fyToken.join(),
        await fyToken.maturity(),
        await fyToken.name(),
        await fyToken.symbol(),
      ],
      'safeERC20Namer.js'
    )

    const baseId = await fyToken.underlyingId()
    const pool = (await ethers.getContractAt('Pool', await ladle.pools(seriesId), ownerAcc)) as Pool
    console.log(`${await fyToken.symbol()}Pool, '${pool.address}'`)
    verify(pool.address, [], 'safeERC20Namer.js')

    // Give access to each of the fyToken governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, Timelock already has ROOT as the deployer
    // Store a plan for isolating FYToken from Ladle and Base Join
    proposal = []

    const join = (await ethers.getContractAt('Join', await ladle.joins(baseId) as string, ownerAcc)) as Join

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [id(fyToken.interface, 'point(bytes32,address)')],
        timelock.address,
      ]),
    })
    console.log(`fyToken.grantRoles(gov, timelock)`)

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
    })
    console.log(`fyToken.grantRole(ROOT, cloak)`)

    const ladlePlan = [
      {
        contact: fyToken.address,
        signatures: [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address, ladlePlan]),
    })
    console.log(`cloak.plan(ladle, fyToken(${bytesToString(seriesId)})): ${await cloak.hash(ladle.address, ladlePlan)}`)

    const joinPlan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
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
