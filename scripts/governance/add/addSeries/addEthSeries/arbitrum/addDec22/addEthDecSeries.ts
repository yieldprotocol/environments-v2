import { ethers } from 'hardhat'
import {
  getOwnerOrImpersonate,
  proposeApproveExecute,
  readAddressMappingIfExists,
} from '../../../../../../../shared/helpers'

import { IOracle, ChainlinkUSDMultiOracle, AccumulatorMultiOracle } from '../../../../../../../typechain'
import { Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../../../../../typechain'

import { CHAINLINKUSD, ACCUMULATOR } from '../../../../../../../shared/constants'

import { addSeriesProposal } from '../../../../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { initPoolsProposal } from '../../../../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateStrategiesProposal } from '../../../../../../fragments/core/strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../../../../../fragments/core/strategies/initStrategiesProposal'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { seriesIlks, poolsInit, newFYTokens, newPools, joins } = require(process.env.CONF as string)
const { strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Series
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newFYTokens, newPools, joins)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))

  // Strategies
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
  }
})()
