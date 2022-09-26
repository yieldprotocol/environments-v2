import { getOwnerOrImpersonate } from '../../../../../shared/helpers'
import { deployIdentityOracle } from '../../shared/deployIdentityOracle'
const { developer, protocol } = require(process.env.CONF as string)

/**
 * @dev This script deploys the IdentityOracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  await deployIdentityOracle(ownerAcc, protocol)
})()
