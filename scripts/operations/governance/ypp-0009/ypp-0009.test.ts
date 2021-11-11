/**
 * @dev This script tests the dust limits for one or more base/ilk pairs.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'

import { bytesToString, jsonToMap } from '../../../../shared/helpers'

import { Cauldron } from '../../../../typechain/Cauldron'

import { newMin } from './updateDust.config'
;(async () => {
  const path =
    hre.network.config.chainId == 42 ? '../../../../addresses/archive/rc12/' : '../../../../addresses/archive/mainnet/'
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>

  let [ownerAcc] = await ethers.getSigners()

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
