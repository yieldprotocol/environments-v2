/**
 * @dev This script tests the dust limits for one or more base/ilk pairs.
 *
 * It takes as inputs the protocol address files.
 */

import { ethers } from 'hardhat'

import {
  getOwnerOrImpersonate,
  getOriginalChainId,
  bytesToString,
  readAddressMappingIfExists
} from '../../../shared/helpers'
import { Witch } from '../../../typechain/Witch'
import { newInitialOffer, developer } from './updateInitialOffer.mainnet.config'

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
  for (let [ilkId, initialOffer] of newInitialOffer) {
    const ilk = await witch.ilks(ilkId)
    if (ilk.initialOffer.toString() === initialOffer.toString())
      console.log(`${bytesToString(ilkId)} set: ${ilk.initialOffer}`)
    else console.log(`${bytesToString(ilkId)} not updated, still at ${ilk.initialOffer}`)
  }
})()
