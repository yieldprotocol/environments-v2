/**
 * @dev This script revokes permissions to a witch
 */

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { id } from '@yield-protocol/utils-v2'
import { ethers } from 'hardhat'
import { Cauldron, Ladle, Witch } from '../../../typechain'
import { AuctionLineAndLimit } from '../../governance/confTypes'

export const replaceWitch = async (
  ownerAcc: SignerWithAddress,
  witch: Witch,
  cauldron: Cauldron,
  ladle: Ladle,
  auctionLineAndLimits: AuctionLineAndLimit[],
  bases: Array<[string, string]>,
  fyTokens: Map<string, string>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('revokeRoles', [
      [id(cauldron.interface, 'give(bytes12,address)'), id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')],
      witch.address,
    ]),
  })
  console.log(`cauldron.revokeRoles(witch)`)

  for (const [assetId] of bases) {
    const join = await ethers.getContractAt('Join', await ladle.joins(assetId), ownerAcc)

    // Revoke Witch to join base
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('revokeRole', [
        id(join.interface, 'join(address,uint128)'),
        witch.address,
      ]),
    })
  }

  for (const [seriesId] of fyTokens) {
    const fyToken = await ethers.getContractAt('FYToken', (await cauldron.series(seriesId)).fyToken, ownerAcc)

    // Revoke Witch to burn fyTokens
    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('revokeRole', [
        id(fyToken.interface, 'burn(address,uint256)'),
        witch.address,
      ]),
    })
  }

  const ilkIds = new Set(auctionLineAndLimits.map(({ ilkId }) => ilkId))
  for (const ilkId of ilkIds) {
    const join = await ethers.getContractAt('Join', await ladle.joins(ilkId), ownerAcc)
    // Revoke Witch to exit ilk
    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('revokeRole', [
        id(join.interface, 'exit(address,uint128)'),
        witch.address,
      ]),
    })
  }

  return proposal
}
