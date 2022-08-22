import { ethers } from 'hardhat'
import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../../../shared/helpers'
import { Join } from '../../../../../typechain'
import { addChainlinkAssetProposal } from '../../../../fragments/assetsAndSeries/addChainlinkAssetProposal'
const {
  developer,
  protocol,
  governance,
  newJoins,
  chainlinkSources,
  debtLimits,
  auctionLimit,
  seriesIlks,
  assetId,
} = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const chainlinkCollateralWand = await ethers.getContractAt(
    'ChainlinkCollateralWand',
    protocol.get('ChainlinkCollateralWand') as string,
    ownerAcc
  )

  const join = (await ethers.getContractAt('Join', newJoins.get(assetId) as string, ownerAcc)) as Join

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(
    await addChainlinkAssetProposal(
      chainlinkCollateralWand,
      assetId,
      join,
      developer,
      chainlinkSources,
      auctionLimit,
      debtLimits,
      seriesIlks
    )
  )
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
