import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../shared/helpers'
import { CompositeMultiOracle, IOracle, StrategyOracle } from '../../../../../typechain'
import { Cauldron, Ladle, OldWitch, Timelock, EmergencyBrake } from '../../../../../typechain'
import { COMPOSITE } from '../../../../../shared/constants'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
import { orchestrateStrategyOracleProposal } from '../../../../fragments/oracles/orchestrateStrategyOracle'
import { updatStrategyOracleSourcesProposal } from '../../../../fragments/oracles/updateStrategyOracleSourcesProposal'
import { updateIlkProposal } from '../../../../fragments/assetsAndSeries/updateIlkProposal'
import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePathsProposal'
import { updateCompositeSourcesProposal } from '../../../../fragments/oracles/updateCompositeSourcesProposal'

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

  const strategyOracle = (await ethers.getContractAt(
    'StrategyOracle',
    protocol.get('strategyOracle') as string,
    ownerAcc
  )) as unknown as StrategyOracle

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = (await ethers.getContractAt(
    'OldWitch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as OldWitch
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
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
  // Add Composite Oracle Source
  proposal = proposal.concat(await updateCompositeSourcesProposal(compositeOracle, compositeSources))
  // Add for composite paths
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))

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

  proposal = proposal.concat(
    await updateIlkProposal(compositeOracle as unknown as IOracle, cauldron, newCompositeLimits)
  )

  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
  }
})()
