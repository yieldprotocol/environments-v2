import { getOwnerOrImpersonate, writeAddressMap } from '../../../shared/helpers'
import { deployJoins } from '../../fragments/assetsAndSeries/deployJoins'
import { Ladle__factory, Timelock__factory } from '../../../typechain'

const { governance, protocol, developer, assetsToAdd } = require(process.env.CONF as string)

/**
 * @dev This script deploys a Join
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const timelock = Timelock__factory.connect(governance.get('timelock') as string, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.get('ladle') as string, ownerAcc)

  const newJoins = await deployJoins(ownerAcc, timelock, ladle, assetsToAdd)
  writeAddressMap('newJoins.json', newJoins) // newJoins.json is a temporary file
})()
