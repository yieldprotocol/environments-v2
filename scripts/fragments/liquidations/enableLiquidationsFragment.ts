/**
 * @dev Enable Witch v2 liquidations for given pairs, and with given fyTokens also accepted as payment
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { ethers } from 'hardhat'
import { bytesToString } from '../../../shared/helpers'
import { Cauldron, Ladle, EmergencyBrake, Witch } from '../../../typechain'
import { AuctionLineAndLimit } from '../../governance/confTypes'

export const enableLiquidationsFragment = async (
  ownerAcc: SignerWithAddress,
  cloak: EmergencyBrake,
  cauldron: Cauldron,
  ladle: Ladle,
  witch: Witch,
  seriesIds: Array<string>,
  auctionLineAndLimits: AuctionLineAndLimit[]
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []
  const baseIds = new Set(auctionLineAndLimits.map(({ baseId }) => baseId))
  const ilkIds = new Set(auctionLineAndLimits.map(({ ilkId }) => ilkId))

  for (const [baseId] of baseIds) {
    const join = await ethers.getContractAt('Join', await ladle.joins(baseId), ownerAcc)

    // Allow Witch to join base
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [
        id(join.interface, 'join(address,uint128)'),
        witch.address,
      ]),
    })

    // Allow to revoke the above permission on emergencies
    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(witch.address, plan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [witch.address, plan]),
      })
      console.log(`cloak.plan(witch, join(${bytesToString(baseId)})): ${await cloak.hash(witch.address, plan)}`)
    }
  }

  for (const [seriesId] of seriesIds) {
    const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, ownerAcc)

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
      console.log(`cloak.plan(witch, burn(${bytesToString(seriesId)})): ${await cloak.hash(witch.address, plan)}`)
    }
  }

  for (const { ilkId, baseId, duration, vaultProportion, collateralProportion, max } of auctionLineAndLimits) {
    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setLineAndLimit', [
        ilkId,
        baseId,
        duration,
        vaultProportion,
        collateralProportion,
        max,
      ]),
    })
    console.log(`Adding baseId: ${bytesToString(baseId)} - ilkId: ${bytesToString(ilkId)} to the Witch`)
  }

  for (const ilkId of ilkIds) {
    const join = await ethers.getContractAt('Join', await ladle.joins(ilkId), ownerAcc)
    // Allow Witch to exit ilk
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRole', [
        id(join.interface, 'exit(address,uint128)'),
        witch.address,
      ]),
    })

    // Log a plan to undo the orchestration above in emergencies
    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'exit(address,uint128)')],
      },
    ]

    if ((await cloak.plans(await cloak.hash(witch.address, plan))).state === 0) {
      proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [witch.address, plan]),
      })
      console.log(`cloak.plan(witch, exit(${bytesToString(ilkId)})): ${await cloak.hash(witch.address, plan)}`)
    }
  }

  return proposal
}
