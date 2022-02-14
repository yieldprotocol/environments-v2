/**
 * @dev This script tests the updated Timelock delay.
 */

import { ethers } from 'hardhat'

import { getOwnerOrImpersonate } from '../../../shared/helpers'

import { Timelock } from '../../../typechain/Timelock'
const { developer, newDelayTime, governance } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const timeLock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const timelockDelay = await timeLock.delay()
  if (timelockDelay === newDelayTime) console.log(`New delay set to ` + timelockDelay)
  else console.log('Still old delay')
})()
