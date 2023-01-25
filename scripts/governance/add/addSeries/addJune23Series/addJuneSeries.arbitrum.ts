import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'

import {
  Timelock__factory,
  OldEmergencyBrake__factory,
  Cauldron__factory,
  Ladle__factory,
  Witch__factory,
  Pool__factory,
} from '../../../../../typechain'

import { TIMELOCK, CLOAK, MULTISIG, CAULDRON, LADLE, WITCH } from '../../../../../shared/constants'

import { addSeriesProposal } from '../../../../fragments/assetsAndSeries/addSeries'
import { addIlksToSeriesProposal } from '../../../../fragments/assetsAndSeries/addIlkToSeries'
import { migrateStrategiesProposal } from '../../../../fragments/strategies/migrateStrategies'
import { orchestrateNewPoolsProposal } from '../../../../fragments/pools/orchestratePool'
import { orchestrateStrategiesProposal } from '../../../../fragments/strategies/orchestrateStrategy'

const { developer, deployer, seriesIlks, migrateData } = require(process.env.CONF as string)
const { governance, protocol, joins, newFYTokens, newPools, newStrategies } = require(process.env.CONF as string)
/**
 * @dev This script orchestrates a new series and rolls liquidity in the related strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cloak = OldEmergencyBrake__factory.connect(governance.getOrThrow(CLOAK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.getOrThrow(LADLE)!, ownerAcc)
  const witch = Witch__factory.connect(protocol.getOrThrow(WITCH)!, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(
    await orchestrateStrategiesProposal(
      ownerAcc,
      deployer,
      governance.getOrThrow(MULTISIG)!,
      timelock,
      ladle,
      newStrategies
    )
  )

  for (let [seriesId, poolAddress] of newPools) {
    const pool = Pool__factory.connect(poolAddress as string, ownerAcc)
    console.log(`orchestrating ${seriesId} pool at address: ${poolAddress}`)
    proposal = proposal.concat(await orchestrateNewPoolsProposal(deployer as string, pool, timelock, cloak))
  }

  proposal = proposal.concat(
    await addSeriesProposal(ownerAcc, deployer, cauldron, ladle, witch, timelock, cloak, joins, newFYTokens, newPools)
  )

  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  proposal = proposal.concat(await migrateStrategiesProposal(ownerAcc, migrateData))
  console.log(`Proposal with ${proposal.length} steps`)
  await propose(timelock, proposal, developer)
})()
