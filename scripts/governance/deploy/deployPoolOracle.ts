import { getOwnerOrImpersonate } from '../../../shared/helpers'
import { deployPoolOracle } from '../../fragments/oracles/deployPoolOracle'

const { protocol } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Pool Oracle
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  await deployPoolOracle(ownerAcc, protocol)
})()
