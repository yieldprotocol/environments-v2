import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import { Timelock__factory, Cauldron__factory, Shifter__factory } from '../../../../typechain'

import { TIMELOCK, CAULDRON, SHIFTER } from '../../../../shared/constants'

import { orchestrateShifter } from '../../../fragments/emergency/orchestrateShifter'
import { migrateDebt } from '../../../fragments/emergency/migrateDebt'
import { isolateShifter } from '../../../fragments/emergency/isolateShifter'

const { developer, deployers, governance, protocol, vaultsToMigrate } = require(process.env.CONF as string)

/**
 * @dev This script changes the seriesId in a number of vaults, keeping the debt and collateral unchanged.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON)!, ownerAcc)
  const shifter = Shifter__factory.connect(protocol.getOrThrow(SHIFTER)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Orchestrate the shifter
  proposal = proposal.concat(
    await orchestrateShifter(deployers.getOrThrow(shifter.address), timelock, cauldron, shifter)
  )

  // Shift the vaults
  for (let [vaultId, seriesId] of vaultsToMigrate) {
    proposal = proposal.concat(await migrateDebt(shifter, vaultId, seriesId))
  }

  // Isolate the shifter
  proposal = proposal.concat(await isolateShifter(cauldron, shifter))

  await propose(timelock, proposal, developer)
})()
