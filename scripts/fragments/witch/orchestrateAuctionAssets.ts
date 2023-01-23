/**
 * @dev Orchestrate Witch v2 for given base assets, collaterals, and series
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { ethers } from 'hardhat'
import { getName } from '../../../shared/helpers'
import { Cauldron, Ladle, OldEmergencyBrake, Witch, Join__factory } from '../../../typechain'

export const orchestrateAuctionAssets = async (
  ownerAcc: SignerWithAddress,
  cloak: OldEmergencyBrake,
  cauldron: Cauldron,
  ladle: Ladle,
  witch: Witch,
  baseIds: Array<string>,
  ilkIds: Array<string>,
  seriesIds: Array<string>,
  nesting: number = 0
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  for (const baseId of baseIds) {
    const join = Join__factory.connect((await ladle.joins(baseId))!, ownerAcc)

    if (!(await join.hasRole(id(join.interface, 'join(address,uint128)'), witch.address))) {
      // Allow Witch to join base
      proposal.push({
        target: join.address,
        data: join.interface.encodeFunctionData('grantRole', [
          id(join.interface, 'join(address,uint128)'),
          witch.address,
        ]),
      })
      console.log(`${'  '.repeat(nesting)}join(${getName(baseId)}).grantRole(join(address,uint128), witch)`)

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
        // console.log(`${'  '.repeat(nesting)}cloak.plan(witch, join(${getName(baseId)})): ${await cloak.hash(witch.address, plan)}`)
      }
    }
  }

  for (const seriesId of seriesIds) {
    const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, ownerAcc)

    if (!(await fyToken.hasRole(id(fyToken.interface, 'burn(address,uint256)'), witch.address))) {
      // Allow Witch to burn fyTokens
      proposal.push({
        target: fyToken.address,
        data: fyToken.interface.encodeFunctionData('grantRole', [
          id(fyToken.interface, 'burn(address,uint256)'),
          witch.address,
        ]),
      })
      console.log(`${'  '.repeat(nesting)}fyToken(${getName(seriesId)}).grantRole(burn(address,uint256), witch)`)

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
        // console.log(`${'  '.repeat(nesting)}cloak.plan(witch, burn(${getName(seriesId)})): ${await cloak.hash(witch.address, plan)}`)
      }
    }
  }

  for (const ilkId of ilkIds) {
    const join = await ethers.getContractAt('Join', await ladle.joins(ilkId), ownerAcc)

    if (!(await join.hasRole(id(join.interface, 'exit(address,uint128)'), witch.address))) {
      // Allow Witch to exit ilk
      proposal.push({
        target: join.address,
        data: join.interface.encodeFunctionData('grantRole', [
          id(join.interface, 'exit(address,uint128)'),
          witch.address,
        ]),
      })
      console.log(`${'  '.repeat(nesting)}join(${getName(ilkId)}).grantRole(exit(address,uint128), witch)`)

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
        // console.log(`${'  '.repeat(nesting)}cloak.plan(witch, exit(${getName(ilkId)})): ${await cloak.hash(witch.address, plan)}`)
      }
    }
  }

  return proposal
}
