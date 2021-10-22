import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { jsonToMap } from '../shared/helpers'

import { Cauldron } from '../typechain/Cauldron'

(async () => {
  const vaultIds: Array<string> = [
    '0xD825EC6DA9DD2E2F4B119158'
  ]
  const [ ownerAcc ] = await ethers.getSigners();
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron

  for (let vaultId of vaultIds) {
    console.log(`${vaultId}: ${(await cauldron.callStatic.level(vaultId)).toString()}`)
  }
})()