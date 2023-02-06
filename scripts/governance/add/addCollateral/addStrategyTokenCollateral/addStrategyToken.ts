import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../shared/helpers'
import { CompositeMultiOracle, IOracle, StrategyOracle } from '../../../../../typechain'
import { Cauldron, Ladle, OldWitch, Timelock, EmergencyBrake } from '../../../../../typechain'
import { COMPOSITE } from '../../../../../shared/constants'
import { orchestrateJoinProposal } from '../../../../fragments/core/removeDeployer'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAsset'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlk'
import { orchestrateStrategyOracleProposal } from '../../../../fragments/oracles/orchestrateStrategyOracle'
import { updatStrategyOracleSourcesProposal } from '../../../../fragments/oracles/updateStrategyOracleSources'
import { updateIlkProposal } from '../../../../fragments/assetsAndSeries/updateIlk'
import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePaths'
import { updateCompositeSourcesProposal } from '../../../../fragments/oracles/updateCompositeSources'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { seriesIlks, strategyOracleSources } = require(process.env.CONF as string)
const {
  newStrategyLimits,
  strategyAuctionLimits,
  assets,
  newJoins,
  newCompositePaths,
  newCompositeLimits,
  compositeSources,
} = require(process.env.CONF as string)

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const strategyOracle = await ethers.getContractAt(
    'StrategyOracle',
    protocol.get('strategyOracle') as string,
    ownerAcc
  )

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = await ethers.getContractAt('OldWitch', protocol.get('witch') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const compositeOracle = await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )
  let assetsAndJoins: [string, string, string][] = []

  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assets.get(assetId) as string, joinAddress])
  }
  console.table(assetsAndJoins)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Oracles
  // Orchestrate Strategy Oracle
  proposal = proposal.concat(await orchestrateStrategyOracleProposal(ownerAcc.address, strategyOracle, timelock, cloak))
  // Add Strategy Oracle Source
  proposal = proposal.concat(await updatStrategyOracleSourcesProposal(strategyOracle, strategyOracleSources))

  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))

  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  // Bases and Ilks
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      strategyOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins,
      newStrategyLimits,
      strategyAuctionLimits
    )
  )

  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
  }
})()
