/**
 * @dev This script tests the updated Timelock delay.
 */

import { ethers } from 'hardhat'

import {
  getOwnerOrImpersonate,
  getOriginalChainId,
  bytesToString,
  readAddressMappingIfExists,
} from '../../../shared/helpers'
import { Timelock } from '../../../typechain/Timelock'
import { newDelayTime, developer } from './updateTimelockDelay.mainnet.config'
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const governance = readAddressMappingIfExists('governance.json')

  // Contract instantiation
  const timeLock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const timelockDelay = await timeLock.delay()
  if (timelockDelay === newDelayTime) console.log(`New delay set to `+timelockDelay)
  else console.log('Still old delay')
})()
