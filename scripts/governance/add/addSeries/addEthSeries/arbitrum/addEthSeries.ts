import { ethers } from 'hardhat'
import { ACCUMULATOR, CHAINLINKUSD } from '../../../../../../shared/constants'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../../shared/helpers'
import { IOracle } from '../../../../../../typechain'
import { addIlksToSeriesProposal } from '../../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { addSeriesProposal } from '../../../../../fragments/assetsAndSeries/addSeriesProposal'
import { initPoolsProposal } from '../../../../../fragments/assetsAndSeries/initPoolsProposal'
import { makeBaseProposal } from '../../../../../fragments/assetsAndSeries/makeBaseProposal'
import { updateIlkProposal } from '../../../../../fragments/assetsAndSeries/updateIlkProposal'
import { initStrategiesProposal } from '../../../../../fragments/core/strategies/initStrategiesProposal'
import { orchestrateStrategiesProposal } from '../../../../../fragments/core/strategies/orchestrateStrategiesProposal'
import { orchestrateModuleProposal } from '../../../../../fragments/modules/orchestrateModuleProposal'
import { updateAccumulatorSourcesProposal } from '../../../../../fragments/oracles/updateAccumulatorSourcesProposal'
import { updateChainlinkUSDSourcesProposal } from '../../../../../fragments/oracles/updateChainlinkUSDSourcesProposal'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol, joins } = require(process.env.CONF as string)
const { chainlinkUSDSources, rateChiSources } = require(process.env.CONF as string)
const { bases, chainlinkDebtLimits } = require(process.env.CONF as string)
const { seriesIlks, poolsInit, newFYTokens, newPools } = require(process.env.CONF as string)
const { strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const chainlinkUSDOracle = await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get(CHAINLINKUSD) as string,
    ownerAcc
  )
  const accumulatorOracle = await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get(ACCUMULATOR) as string,
    ownerAcc
  )
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)
  const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)
  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const proposal = [
    await orchestrateModuleProposal(ladle, protocol.get('wrapEtherModule') as string),
    await updateAccumulatorSourcesProposal(accumulatorOracle, rateChiSources),
    await updateChainlinkUSDSourcesProposal(chainlinkUSDOracle, chainlinkUSDSources),
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, ladle, witch, cloak, bases),
    await updateIlkProposal(chainlinkUSDOracle as unknown as IOracle, cauldron, chainlinkDebtLimits),
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, newFYTokens, newPools, joins),
    await addIlksToSeriesProposal(cauldron, seriesIlks),
    await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit),
    await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData),
    await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit),
  ].flat(1)

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
  }
})()
