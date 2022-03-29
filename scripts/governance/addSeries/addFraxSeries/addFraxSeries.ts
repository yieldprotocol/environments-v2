import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute, readAddressMappingIfExists } from '../../../../shared/helpers'

import {
  IOracle,
  ChainlinkMultiOracle,
  CompositeMultiOracle,
  UniswapV3Oracle,
  CompoundMultiOracle,
  AccumulatorMultiOracle,
} from '../../../../typechain'
import { Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../../typechain'

import { COMPOUND, COMPOSITE, CHAINLINK, UNISWAP, ACCUMULATOR } from '../../../../shared/constants'

import { orchestrateModuleProposal } from '../../../fragments/modules/orchestrateModuleProposal'
import { updateChiSourcesProposal } from '../../../fragments/oracles/updateChiSourcesProposal'
import { updateRateSourcesProposal } from '../../../fragments/oracles/updateRateSourcesProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'
import { makeBaseProposal } from '../../../fragments/assetsAndSeries/makeBaseProposal'
import { updateIlkProposal } from '../../../fragments/assetsAndSeries/updateIlkProposal'
import { addSeriesProposal } from '../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { initPoolsProposal } from '../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateStrategiesProposal } from '../../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../../fragments/core/strategies/initStrategiesProposal'
import { updateAccumulatorSourcesProposal } from '../../../fragments/oracles/updateAccumulatorSourcesProposal'
import { orchestrateAccumulatorOracleProposal } from '../../../fragments/oracles/orchestrateAccumulatorOracleProposal'
import { orchestrateJoinProposal } from '../../../fragments/assetsAndSeries/orchestrateJoinProposal'
import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { updateUniswapSourcesProposal } from '../../../fragments/oracles/updateUniswapSourcesProposal'
import { updateChainlinkSourcesProposal } from '../../../fragments/oracles/updateChainlinkSourcesProposal'
import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateSpotOracleProposal } from '../../../fragments/oracles/updateSpotOracleProposal'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol, chainId } = require(process.env.CONF as string)
const { newCompositePaths, newRateSources, newChiSources, rateChiSources, compositeSources } = require(process.env
  .CONF as string)
const { bases, newChainlinkLimits, assetsToAdd, newCompositeLimits, newJoins } = require(process.env.CONF as string)
const { seriesIlks, poolsInit, newFYTokens, newPools } = require(process.env.CONF as string)
const { strategiesData, strategiesInit, newStrategies, chainlinkSources } = require(process.env.CONF as string)

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
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
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
  // console.log(` AssetId      | Asset Address                            | Join Address`)

  for (let [assetId, joinAddress] of newJoins) {
    assetsAndJoins.push([assetId, assetsToAdd.get(assetId) as string, joinAddress])
    // console.log(`${[assetId, bases.get(assetId) as string, joinAddress]}`)
  }
  console.table(assetsAndJoins)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Oracles
  proposal = proposal.concat(await orchestrateAccumulatorOracleProposal(deployer, accumulatorOracle, timelock, cloak))
  proposal = proposal.concat(await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources))
  proposal = proposal.concat(await updateChainlinkSourcesProposal(chainlinkOracle, chainlinkSources))

  proposal = proposal.concat(await updateCompositeSourcesProposal(compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))

  proposal = proposal.concat(await orchestrateJoinProposal(ownerAcc, deployer, ladle, timelock, cloak, assetsAndJoins))
  proposal = proposal.concat(await addAssetProposal(ownerAcc, cauldron, ladle, assetsAndJoins))
  // Bases and Ilks
  proposal = proposal.concat(
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, ladle, witch, cloak, bases)
  )
  proposal = proposal.concat(
    await updateIlkProposal(chainlinkOracle as unknown as IOracle, cauldron, newChainlinkLimits)
  )
  // proposal = proposal.concat(
  //   await updateIlkProposal(
  //     (chainId == 1 ? uniswapOracle : chainlinkOracle) as unknown as IOracle,
  //     cauldron,
  //     newUniswapLimits
  //   )
  // )
  proposal = proposal.concat(
    await updateIlkProposal(compositeOracle as unknown as IOracle, cauldron, newCompositeLimits)
  )

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
  }
})()
