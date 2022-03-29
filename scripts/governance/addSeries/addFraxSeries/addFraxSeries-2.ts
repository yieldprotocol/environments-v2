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

import { addSeriesProposal } from '../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { initPoolsProposal } from '../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateStrategiesProposal } from '../../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../../fragments/core/strategies/initStrategiesProposal'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol, chainId } = require(process.env.CONF as string)
const { assetsToAdd, newJoins } = require(process.env.CONF as string)
const { seriesIlks, poolsInit, newFYTokens, newPools } = require(process.env.CONF as string)
const { strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

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

  // Series
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newFYTokens, newPools)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))

  // Strategies
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
  }
})()
