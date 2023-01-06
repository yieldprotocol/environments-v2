/**
 * @dev This script tests the cauldron debt limits.
 */

import { ethers } from 'hardhat'

import { getOwnerOrImpersonate, getName } from '../../../../shared/helpers'
import { Cauldron } from '../../../../typechain'
const { protocol, developer, newLimits } = require('./updateLimits.mainnet.config')

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  console.log(`Limits:`)
  for (let [baseId, ilkId, max, min, dec] of newLimits) {
    const debt = await cauldron.debt(baseId, ilkId)

    if (debt.max.toString() === max.toString()) console.log(`${getName(ilkId)} max set: ${debt.max}`)
    else console.log(`${getName(ilkId)} not updated, still at ${debt.max}`)
    if (debt.min.toString() === min.toString()) console.log(`${getName(ilkId)} min set: ${debt.min}`)
    else console.log(`${getName(ilkId)} not updated, still at ${debt.min}`)
    if (debt.dec.toString() === dec.toString()) console.log(`${getName(ilkId)} dec set: ${debt.dec}`)
    else console.log(`${getName(ilkId)} not updated, still at ${debt.dec}`)
  }
})()
