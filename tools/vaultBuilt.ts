/**
 * @dev This script cancels the debt from a number of vaults.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../../shared/helpers'

import { Cauldron } from '../../typechain/Cauldron'
import { Timelock } from '../../typechain/Timelock'
import { Relay } from '../../typechain/Relay'
;(async () => {
  const vaultIds: Array<string> = ['0x3f9765c9a4601ff812bcff99']
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  const filter = cauldron.filters.VaultBuilt(null, null, null, null)
  const events = await cauldron.queryFilter(filter)
  for (let event of events) {
    if (event.args.ilkId === '0x555344430000') {
      console.log(event)
      console.log((await cauldron.balances(event.args.vaultId)).art.toString())
    }
  }
})()
