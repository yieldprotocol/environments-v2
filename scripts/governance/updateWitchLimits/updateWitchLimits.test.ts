/**
 * @dev This script tests the witch auction limits.
 */

import { ethers } from 'hardhat'

import {
  getOwnerOrImpersonate,
  getOriginalChainId,
  bytesToString,
  readAddressMappingIfExists
} from '../../../shared/helpers'
import { Witch } from '../../../typechain/Witch'
import { newLimits, developer } from './updateWitchLimits.mainnet.config'

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json');

  // Contract instantiation
  const witch = ((await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown) as Witch
  for (let [ilkId, line, dust, dec] of newLimits) {
    const limits = await witch.limits(ilkId)
    if (limits.line.toString() === line.toString())
      console.log(`${bytesToString(ilkId)} set: ${limits.line}`)
    else console.log(`${bytesToString(ilkId)} not updated, still at ${limits.line}`)
    if (limits.dust.toString() === dust.toString())
      console.log(`${bytesToString(ilkId)} set: ${limits.dust}`)
    else console.log(`${bytesToString(ilkId)} not updated, still at ${limits.dust}`)
    if (limits.dec.toString() === dec.toString())
      console.log(`${bytesToString(ilkId)} set: ${limits.dec}`)
    else console.log(`${bytesToString(ilkId)} not updated, still at ${limits.dec}`)
  }
})()
