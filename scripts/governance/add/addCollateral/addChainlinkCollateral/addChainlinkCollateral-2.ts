import { ethers } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../shared/helpers'
import { orchestrateJoinProposal } from '../../../../fragments/core/removeDeployerRootToCloak'
import { updateChainlinkSourcesProposal } from '../../../../fragments/oracles/updateChainlinkSources'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAsset'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlk'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
import { IOracle } from '../../../../../typechain'
import {
  developer,
  deployer,
  chainlinkSources,
  assets,
  debtLimits,
  auctionLimits,
  seriesIlks,
} from './addMKR.rinkeby.config'

/**
 * @dev This script configures the Yield Protocol to use a collateral with a Chainlink oracle vs. ETH.
 * Previously, the collateral should have been added as an asset with the Wand.
 * Add collateral as an asset
 * --- You are here ---
 * Add the collateral/ETH source to the Chainlink Oracle
 * Permission the collateral Join
 * Make collateral into an Ilk
 * Approve collateral as collateral for all series
 */
;(async () => {
  const chainId = await getOriginalChainId()

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
  for (let [assetId, joinAddress] of joins) {
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
      joins,
      debtLimits,
      auctionLimits
    )
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
