/**
 * @dev This script tests the dust limits for one or more base/ilk pairs.
 *
 * It takes as inputs the protocol address files.
 */

import { ethers } from 'hardhat'

import {
  getOwnerOrImpersonate,
  getOriginalChainId,
  getName,
  getGovernanceProtocolAddresses,
} from '../../../shared/helpers'
import { Cauldron } from '../../../typechain/Cauldron'
import { newLimits, developer } from './updateCeiling.config'
;(async () => {
  const chainId = await getOriginalChainId()
  const [governance, protocol] = await getGovernanceProtocolAddresses(chainId)
  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  for (let [baseId, ilkId, maxDebt] of newLimits) {
    const debt = await cauldron.debt(baseId, ilkId)
    if (debt.max.toString() === maxDebt.toString()) console.log(`${getName(baseId)}/${getName(ilkId)} set: ${debt.max}`)
    else console.log(`${getName(baseId)}/${getName(ilkId)} not updated, still at ${debt.max}`)
  }
})()
