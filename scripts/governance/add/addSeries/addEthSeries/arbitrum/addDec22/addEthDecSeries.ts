import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../../../shared/helpers'
import {
  Cauldron__factory,
  EmergencyBrake__factory,
  Ladle__factory,
  PoolNonTv__factory,
  Timelock__factory,
} from '../../../../../../../typechain'

import { addIlksToSeriesProposal } from '../../../../../../fragments/assetsAndSeries/addIlkToSeries'
import { addSeriesProposal } from '../../../../../../fragments/assetsAndSeries/addSeries'
import { initPoolsProposal } from '../../../../../../fragments/pools/initPools'
import { orchestrateNewPoolsProposal } from '../../../../../../fragments/assetsAndSeries/orchestrateNonTvPoolsProposal'
import { initStrategiesProposal } from '../../../../../../fragments/strategies/initStrategies'
import { orchestrateStrategiesProposal } from '../../../../../../fragments/strategies/orchestrateStrategy'

const { developer, deployer } = require(process.env.CONF as string)
const { governance, protocol } = require(process.env.CONF as string)
const { seriesIlks, poolsInit, newFYTokens, newPools, joins } = require(process.env.CONF as string)
const { strategiesData, strategiesInit, newStrategies } = require(process.env.CONF as string)

/**
 * @dev This script sets up the oracles
 */
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const cauldron = Cauldron__factory.connect(protocol.get('cauldron') as string, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.get('ladle') as string, ownerAcc)
  const cloak = EmergencyBrake__factory.connect(governance.get('cloak') as string, ownerAcc)
  const timelock = Timelock__factory.connect(governance.get('timelock') as string, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Series
  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, joins, newFYTokens, newPools)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  for (let [seriesId, poolAddress] of newPools) {
    const pool = PoolNonTv__factory.connect(poolAddress as string, ownerAcc)
    console.log(`orchestrating pool for series: ${seriesId} at address: ${poolAddress}`)
    proposal = proposal.concat(await orchestrateNewPoolsProposal(deployer as string, pool, timelock, cloak))
  }
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))

  // Strategies
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, newStrategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, newStrategies, ladle, timelock, strategiesInit))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
  }
})()
