import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'

import {
  Timelock__factory,
  Ladle__factory,
} from '../../../../typechain'

import { TIMELOCK, CONTANGO_LADLE } from '../../../../shared/constants'

import { addPool } from '../../../fragments/ladle/addPool'
import { addIntegration } from '../../../fragments/ladle/addIntegration'
import { addToken } from '../../../fragments/ladle/addToken'


const { developer, governance, protocol, newSeries, newStrategies } = require(process.env
  .CONF as string)

/**
 * @dev This restores contango with the new pools and strategies
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK)!, ownerAcc)
  const contangoLadle = Ladle__factory.connect(protocol.getOrThrow(CONTANGO_LADLE)!, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  for (let series of newSeries) {
    proposal = proposal.concat(await addPool(contangoLadle, series.seriesId, series.pool.address))
  }


  // The new strategies are now orchestrated and invested in the new pools
  for (let newStrategy of newStrategies) {
    proposal = proposal.concat(
      await addIntegration(
        contangoLadle,
        newStrategy.address,
      )
    )
    proposal = proposal.concat(
      await addToken(
        contangoLadle,
        newStrategy.address,
      )
    )
  }

  await propose(timelock, proposal, developer)
})()
