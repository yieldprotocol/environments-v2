import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'

import {
  Pool__factory,
  Cauldron__factory,
  Ladle__factory,
  Timelock__factory,
  OldEmergencyBrake__factory,
} from '../../../../../typechain'

import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeriesProposal'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlksToSeriesProposal'
import { migrateStrategiesProposal } from '../../../../fragments/strategies/migrateStrategiesProposal'
import { initPoolsProposal } from '../../../../fragments/assetsAndSeries/initPoolsProposal'
import { orchestrateNewPoolsProposal } from '../../../../fragments/assetsAndSeries/orchestrateNewPoolsProposal'

const { developer, deployer, seriesIlks, poolsInit, migrateData } = require(process.env.CONF as string)
const { protocol, governance, joins, newPools, newFYTokens } = require(process.env.CONF as string)
/**
 * @dev This script orchestrates a new series and rolls liquidity in the related strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const cauldron = Cauldron__factory.connect(protocol.getOrThrow('cauldron')!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.getOrThrow('ladle')!, ownerAcc)
  const timelock = Timelock__factory.connect(governance.getOrThrow('timelock')!, ownerAcc)
  const cloak = OldEmergencyBrake__factory.connect(governance.getOrThrow('cloak')!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []
  for (let [seriesId, poolAddress] of newPools) {
    const pool = Pool__factory.connect(poolAddress as string, ownerAcc)
    console.log(`orchestrating ${seriesId} pool at address: ${poolAddress}`)
    proposal = proposal.concat(await orchestrateNewPoolsProposal(deployer as string, pool, timelock, cloak))
  }

  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, timelock, cloak, joins, newFYTokens, newPools)
  )
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, timelock, newPools, poolsInit))
  proposal = proposal.concat(await migrateStrategiesProposal(ownerAcc, migrateData))
  await propose(timelock, proposal, developer)
})()
