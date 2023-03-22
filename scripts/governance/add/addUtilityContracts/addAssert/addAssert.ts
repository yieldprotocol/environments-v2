import { Timelock__factory, Ladle__factory } from '../../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../../shared/helpers'
import { addIntegration } from '../../../../fragments/ladle/addIntegration'
import { TIMELOCK, LADLE, LIMITED_ASSERT, LIMITED_ASSERT_V2 } from '../../../../../shared/constants'

const { developer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script adds the (limited) Assert contract to Ladle as an integration
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), ownerAcc)
  const ladle = Ladle__factory.connect(protocol().getOrThrow(LADLE), ownerAcc)

  let proposal: Array<{ target: string; data: string }> = await addIntegration(
    ladle,
    protocol().getOrThrow(LIMITED_ASSERT_V2)
  )
  await propose(timelock, proposal, developer)
})()
