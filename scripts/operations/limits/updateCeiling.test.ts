/**
 * @dev This script updates the ceiling limits for one or more base/ilk pairs.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'

import { bytesToString, jsonToMap } from '../../../shared/helpers'

import { Cauldron } from '../../../typechain/Cauldron'

import { newMax } from './updateCeiling.config'

;(async () => {
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  let [ownerAcc] = await ethers.getSigners()
  
  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  for (let [baseId, ilkId, maxDebt] of newMax) {
    const debt = await cauldron.debt(baseId, ilkId)
    if (debt.max.toString() === maxDebt.toString()) console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)} set: ${debt.max}`)
    else console.log(`${bytesToString(baseId)}/${bytesToString(ilkId)} not updated, still at ${debt.max}`)
  }
})()
