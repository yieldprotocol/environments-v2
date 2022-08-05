import { ethers } from 'hardhat'
import { proposeApproveExecute, getOwnerOrImpersonate, readAddressMappingIfExists } from '../../../../../shared/helpers'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { updateChainlinkSourcesProposal } from '../../../../fragments/oracles/updateChainlinkSourcesProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { IOracle } from '../../../../../typechain'
const {
  developer,
  deployer,
  protocol,
  governance,
  newJoins,
  chainlinkSources,
  assets,
  debtLimits,
  auctionLimits,
  seriesIlks,
} = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const joins = readAddressMappingIfExists('joins.json')
  const governance = readAddressMappingIfExists('governance.json')

  const chainlinkOracle = await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  let assetsAndJoins: Array<[string, string, string]> = []
  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
    console.log(`${[assetId, assets.get(assetId), joinAddress]}`)
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, chainlinkSources))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      chainlinkOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins,
      debtLimits,
      auctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
