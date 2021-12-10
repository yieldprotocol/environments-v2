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
  getGovernanceProtocolAddresses
} from '../../../shared/helpers'
import { Cauldron } from '../../../typechain/Cauldron'
import { newMin, developer } from './updateDust.config'

;(async () => {
  const chainId = await getOriginalChainId()
  const [governance, protocol] = await getGovernanceProtocolAddresses(chainId)
  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  // Contract instantiation
  const cauldron = ((await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown) as Cauldron
  for (let [baseId, ilkId, minDebt] of newMin) {
    const debt = await cauldron.debt(baseId, ilkId)
    if (debt.min.toString() === minDebt.toString())
      console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)} set: ${debt.min}`)
    else console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)} not updated, still at ${debt.min}`)
  }
})()
