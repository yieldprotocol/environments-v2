import { id } from '@yield-protocol/utils-v2'
import { BytesLike } from 'ethers'
import { ChainlinkCollateralWand, Join } from './../../../typechain'

export const addChainlinkAssetProposal = async (
  chainlinkCollateralWand: ChainlinkCollateralWand,
  assetId: BytesLike,
  join: Join,
  deployer: String,
  chainlinkSource: [string, string, string],
  auctionLimit: [string, number, string, number, number, number],
  debtLimits: Array<[string, string, number, number, number, number]>,
  seriesIlks: Array<[string, string[]]>
): Promise<Array<{ target: string; data: string }>> => {
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRole', [
      id(join.interface, 'grantRoles(bytes4[],address)'),
      chainlinkCollateralWand.address,
    ]),
  })

  proposal.push({
    target: join.address,
    data: join.interface.encodeFunctionData('grantRole', ['0x00000000', chainlinkCollateralWand.address]),
  })

  proposal.push({
    target: chainlinkCollateralWand.address,
    data: chainlinkCollateralWand.interface.encodeFunctionData('addChainlinkCollateral', [
      assetId,
      join.address,
      deployer,
      chainlinkSource,
      auctionLimit,
      debtLimits,
      seriesIlks,
    ]),
  })

  return proposal
}
