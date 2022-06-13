import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployYVPools } from '../../fragments/assetsAndSeries/deployYVPools'
import { Timelock, YieldMath } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer, yvPoolData } = require(process.env.CONF as string)

/**
 * @dev This script deploys Pools
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const yieldMath = (await ethers.getContractAt(
    '@yield-protocol/yieldspace-tv/src/YieldMath.sol:YieldMath',
    protocol.get('yieldMath') as string,
    ownerAcc
  )) as unknown as YieldMath

  const newPools = await deployYVPools(ownerAcc, timelock, yieldMath, yvPoolData)
  writeAddressMap('newPools.json', newPools) // newPools.json is a temporary file
})()