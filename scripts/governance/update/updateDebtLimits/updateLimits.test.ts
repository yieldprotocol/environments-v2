/**
 * @dev This script tests the cauldron debt limits.
 */

import { ethers } from 'hardhat'

import { getOwnerOrImpersonate, getName } from '../../../../shared/helpers'
import { Cauldron } from '../../../../typechain'
const { protocol, developer, newLimits } = require('./updateLimits.arb_mainnet.config')

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  for (let {
    baseId,
    ilkId,
    debtLimits: { line, dust, dec },
  } of newLimits) {
    const debt = await cauldron.debt(baseId, ilkId)
    if (debt.max.toString() === line.toString()) console.log(`${getName(ilkId)} max set: ${debt.max}`)
    else console.log(`${getName(ilkId)} not updated, still at ${debt.max}`)
    if (debt.min.toString() === dust.toString()) console.log(`${getName(ilkId)} min set: ${debt.min}`)
    else console.log(`${getName(ilkId)} not updated, still at ${debt.min}`)
    if (debt.dec.toString() === dec.toString()) console.log(`${getName(ilkId)} dec set: ${debt.dec}`)
    else console.log(`${getName(ilkId)} not updated, still at ${debt.dec}`)
  }
})()
