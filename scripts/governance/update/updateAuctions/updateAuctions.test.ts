/**
 * @dev This script tests the witch auction limits.
 */

import { ethers } from 'hardhat'

import {
  getOwnerOrImpersonate,
  getOriginalChainId,
  bytesToString,
  readAddressMappingIfExists,
} from '../../../../shared/helpers'
import { Witch } from '../../../../typechain/Witch'
import { newLimits, developer } from './updateAuctions.mainnet.config'
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')

  // Contract instantiation
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch

  console.log(`Limits:`)
  for (let [ilkId, initialOffer, line, dust, dec] of newLimits) {
    const limits = await witch.limits(ilkId)
    const ilk = await witch.ilks(ilkId)

    if (limits.line.toString() === line.toString()) console.log(`${bytesToString(ilkId)} line set: ${limits.line}`)
    else console.log(`${bytesToString(ilkId)} not updated, still at ${limits.line}`)
    if (limits.dust.toString() === dust.toString()) console.log(`${bytesToString(ilkId)} dust set: ${limits.dust}`)
    else console.log(`${bytesToString(ilkId)} not updated, still at ${limits.dust}`)
    if (limits.dec.toString() === dec.toString()) console.log(`${bytesToString(ilkId)} dec set: ${limits.dec}`)
    else console.log(`${bytesToString(ilkId)} not updated, still at ${limits.dec}`)
    if (ilk.initialOffer.toString() === initialOffer.toString())
      console.log(`${bytesToString(ilkId)} initialOffer set: ${ilk.initialOffer}`)
    else console.log(`${bytesToString(ilkId)} not updated, still at ${ilk.initialOffer}`)
  }
})()
