import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { bytesToString, jsonToMap } from '../shared/helpers'
import { seriesData } from '../core/config'

import { Cauldron } from '../typechain/Cauldron'

(async () => {
  const [ owner ] = await ethers.getSigners();
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, owner) as unknown as Cauldron

  for (let [seriesId, , , ilkIds] of seriesData) {
    const symbol = bytesToString(seriesId)

    await cauldron.addIlks(seriesId, ilkIds); console.log(`addIlks ${symbol}: ${ilkIds}'`)
  }
})()
