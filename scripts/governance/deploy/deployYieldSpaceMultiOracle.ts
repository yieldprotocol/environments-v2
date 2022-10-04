import { getOwnerOrImpersonate } from '../../../shared/helpers'
import { deployYieldSpaceMultiOracle } from '../../fragments/oracles/deployYieldSpaceMultiOracle'
import { Timelock__factory } from '../../../typechain'
import { TIMELOCK } from '../../../shared/constants'

const { protocol, governance, developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the YieldSpaceMultiOracle
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)

  await deployYieldSpaceMultiOracle(ownerAcc, timelock, protocol)
})()
