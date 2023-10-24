import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  AccumulatorMultiOracle__factory,
} from '../../../../typechain'

import { ZERO, RATE, TEN_PC } from '../../../../shared/constants'
import { TIMELOCK, ACCUMULATOR } from '../../../../shared/constants'

import { updateAccumulatorPerSecondRate } from '../../../fragments/oracles/updateAccumulatorPerSecondRate'

const { developer, governance, protocol, bases } = require(process.env
  .CONF as string)

/**
 * @dev This updates the per second rate on the accumulator oracle to 10% for all bases
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const accumulator = AccumulatorMultiOracle__factory.connect(protocol.getOrThrow(ACCUMULATOR)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  for (let base of bases.values()) {
    // Update the per second rate on accumulators
    proposal = proposal.concat(await updateAccumulatorPerSecondRate(accumulator, {
      baseId: base.assetId,
      kind: RATE,
      startRate: ZERO, // Ignored
      perSecondRate: TEN_PC
    }))
  }

  await propose(timelock, proposal, developer)
})()