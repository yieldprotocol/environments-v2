import { getOwnerOrImpersonate, writeAddressMap } from '../../../shared/helpers'

import { Timelock__factory, YieldMath__factory } from '../../../typechain'
import { deployNonTVPools } from '../../fragments/assetsAndSeries/deployNonTVPools'

const { protocol, governance } = require(process.env.CONF as string)
const { developer, nonTVPoolData } = require(process.env.CONF as string)

/**
 * @dev This script deploys Pools
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = Timelock__factory.connect(governance.get('timelock') as string, ownerAcc)
  const yieldMath = YieldMath__factory.connect(protocol.get('yieldMath') as string, ownerAcc)

  const newPools = await deployNonTVPools(ownerAcc, timelock, yieldMath, nonTVPoolData)
  writeAddressMap('newPools.json', newPools) // newPools.json is a temporary file
})()
