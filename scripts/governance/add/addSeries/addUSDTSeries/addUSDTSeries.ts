import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, propose, stringToBytes6 } from '../../../../../shared/helpers'

import {
  IOracle,
  ChainlinkMultiOracle,
  CompositeMultiOracle,
  UniswapV3Oracle,
  AccumulatorMultiOracle,
  OnChainTest,
} from '../../../../../typechain'
import { Cauldron, Ladle, OldWitch, Timelock, EmergencyBrake } from '../../../../../typechain'

import { COMPOSITE, CHAINLINK, UNISWAP, ACCUMULATOR } from '../../../../../shared/constants'

import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePathsProposal'
import { updateCompositeSourcesProposal } from '../../../../fragments/oracles/updateCompositeSourcesProposal'
import { makeBaseProposal } from '../../../../fragments/assetsAndSeries/makeBaseProposal'
import { updateIlkProposal } from '../../../../fragments/assetsAndSeries/updateIlkProposal'
import { updateAccumulatorSourcesProposal } from '../../../../fragments/oracles/updateAccumulatorSourcesProposal'
import { orchestrateAccumulatorOracleProposal } from '../../../../fragments/oracles/orchestrateAccumulatorOracleProposal'
import { orchestrateJoinProposal } from '../../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../../fragments/assetsAndSeries/addAssetProposal'
import { updateChainlinkSourcesProposal } from '../../../../fragments/oracles/updateChainlinkSourcesProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeriesProposal'
import { initPoolsProposal } from '../../../../fragments/assetsAndSeries/initPoolsProposal'
import { initStrategiesProposal } from '../../../../fragments/strategies/initStrategiesProposal'
import { orchestrateStrategiesProposal } from '../../../../fragments/strategies/orchestrateStrategiesProposal'
import { onChainTestProposal } from '../../../../fragments/utils/onChainTestProposal'
import { makeIlkProposal } from '../../../../fragments/assetsAndSeries/makeIlkProposal'
const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const {
  newCompositePaths,
  rateChiSources,
  compositeSources,
  newFYTokens,
  newPools,
  seriesIlks,
  poolsInit,
  newStrategies,
  strategiesData,
  strategiesInit,
} = require(process.env.CONF as string)
const { bases, newChainlinkLimits, chainlinkAuctionLimits, assetsToAdd, newCompositeLimits, newJoins } = require(process
  .env.CONF as string)
const { chainlinkSources } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const chainlinkOracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get(CHAINLINK) as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const uniswapOracle = (await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol.get(UNISWAP) as string,
    ownerAcc
  )) as unknown as UniswapV3Oracle
  const accumulatorOracle = (await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get(ACCUMULATOR) as string,
    ownerAcc
  )) as unknown as AccumulatorMultiOracle
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
  console.log(witch.interface)
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

  let assetsAndJoins: [string, string, string][] = []

  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assetsToAdd.get(assetId) as string, joinAddress])
  }
  console.table(assetsAndJoins)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Oracles
  // proposal = proposal.concat(await orchestrateAccumulatorOracleProposal(deployer, accumulatorOracle, timelock, cloak))
  proposal = proposal.concat(await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources))
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, chainlinkSources))

  // todo: Alberto, which oracles do we need?
  proposal = proposal.concat(await updateCompositeSourcesProposal(ownerAcc, compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))

  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  // Bases and Ilks
  proposal = proposal.concat(
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, witch, cloak, bases)
  )

  // todo: Alberto
  proposal = proposal.concat(
    await makeIlkProposal(
      ownerAcc,
      chainlinkOracle as unknown as IOracle,
      cauldron,
      witch,
      cloak,
      newJoins,
      newChainlinkLimits,
      chainlinkAuctionLimits
    )
  )

  // proposal = proposal.concat(
  //   await updateIlkProposal(chainlinkOracle as unknown as IOracle, cauldron, newChainlinkLimits)
  // )
  proposal = proposal.concat(
    await updateIlkProposal(compositeOracle as unknown as IOracle, cauldron, newCompositeLimits)
  )

  // // Series
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newJoins, newFYTokens, newPools)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))

  // Strategies
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))
  // proposal = proposal.concat(await onChainTestProposal(cauldron, onChainTest, assetsAndJoins))
  if (proposal.length > 0) {
    // Propose, Approve & execute
    await propose(timelock, proposal, governance.get('multisig') as string)
  }
})()
