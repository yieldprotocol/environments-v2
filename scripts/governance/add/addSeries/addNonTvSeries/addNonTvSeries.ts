import { ethers, network } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute, jsonToMap } from '../../../../../shared/helpers'
import * as fs from 'fs'
import {
  IOracle,
  ChainlinkMultiOracle,
  CompositeMultiOracle,
  UniswapV3Oracle,
  CompoundMultiOracle,
} from '../../../../../typechain'
import { Cauldron, Ladle, Witch, Timelock, EmergencyBrake, Pool } from '../../../../../typechain'

import { COMPOUND, COMPOSITE, CHAINLINK, UNISWAP } from '../../../../../shared/constants'

import { orchestrateModuleProposal } from '../../../../fragments/modules/orchestrateModuleProposal'
import { updateChiSourcesProposal } from '../../../../fragments/oracles/updateChiSources'
import { updateRateSourcesProposal } from '../../../../fragments/oracles/updateRateSources'
import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePaths'
import { makeBaseProposal } from '../../../../fragments/assetsAndSeries/makeBase'
import { updateIlkProposal } from '../../../../fragments/assetsAndSeries/updateIlk'
import { registerPoolsWithLadle } from '../../../../fragments/assetsAndSeries/registerPoolsWithLadle'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
import { initPoolsProposal } from '../../../../fragments/pools/initPool'
import { orchestrateStrategiesProposal } from '../../../../fragments/strategies/orchestrateStrategy'
import { initStrategiesProposal } from '../../../../fragments/strategies/initStrategy'
import { orchestrateNewPoolsProposal } from '../../../../fragments/pools/orchestratePool'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol, chainId } = require(process.env.CONF as string)
const { newCompositePaths, newRateSources, newChiSources } = require(process.env.CONF as string)
const { bases, newChainlinkLimits, newUniswapLimits, newCompositeLimits } = require(process.env.CONF as string)
const { seriesIlks, poolsInit, newFYTokens, newPools, joins } = require(process.env.CONF as string)
const { strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

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

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  //orchestrate newPools
  const path = `./addresses/${network.name}/`
  const pools = jsonToMap(fs.readFileSync(`${path}newPools.json`, 'utf8')) as Map<string, string>

  for (let [seriesId, poolAddress] of pools) {
    const pool: Pool = (await ethers.getContractAt('Pool', poolAddress as string, ownerAcc)) as unknown as Pool

    console.log(`adding proposal for pool for series: ${seriesId} at address: ${poolAddress}`)
    proposal = proposal.concat(await orchestrateNewPoolsProposal(deployer as string, pool as Pool, timelock, cloak))
  }

  proposal = proposal.concat(await registerPoolsWithLadle(ownerAcc, ladle, newPools))

  // TODO: need to fund timelock for this
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))

  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))

  console.log('**************************************************************************************************')
  console.log('**************************************************************************************************')
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
