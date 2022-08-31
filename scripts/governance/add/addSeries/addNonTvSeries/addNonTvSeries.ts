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
import { updateChiSourcesProposal } from '../../../../fragments/oracles/updateChiSourcesProposal'
import { updateRateSourcesProposal } from '../../../../fragments/oracles/updateRateSourcesProposal'
import { updateCompositePathsProposal } from '../../../../fragments/oracles/updateCompositePathsProposal'
import { makeBaseProposal } from '../../../../fragments/assetsAndSeries/makeBaseProposal'
import { updateIlkProposal } from '../../../../fragments/assetsAndSeries/updateIlkProposal'
import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { initPoolsProposal } from '../../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateStrategiesProposal } from '../../../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../../../fragments/core/strategies/initStrategiesProposal'
import { orchestrateNewPoolsProposal } from '../../../../fragments/assetsAndSeries/orchestrateNewPoolsProposal'

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

  // NOTE: NO ROLLER
  // proposal = proposal.concat(await orchestrateRollerProposal(deployer, strategies, roller, timelock, cloak, rollData))

  // NOTE: This does a bunch of stuff (like orchestrate FYTokens) that's already done.
  // ALSO: I think? we might need to UNREGISTER the bad pools from the lalde?
  // SO: Should I just create a new script that only registers/unregisters the pools w ladle?
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, joins, newFYTokens, newPools)
  )

  // NOTE: I dont think i need to addIlksToSeries since it was done previously
  // proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  // TODO: need to fund timelock for this
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))

  // NOTE: We don't need to do this since we're not rolling, we're creating new
  // proposal = proposal.concat(await rollStrategiesProposal(ownerAcc, protocol, strategies, newPools, timelock, rollData))

  // Strategies -- TODO: This
  // proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  // proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))

  console.log('**************************************************************************************************')
  console.log('**************************************************************************************************')
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
