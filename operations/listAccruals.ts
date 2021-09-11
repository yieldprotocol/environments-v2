/**
 * @dev This script cancels the debt from a number of vaults.
 * 
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, bytesToString } from '../shared/helpers'
import { MAX256 as NOT_MATURE } from '../shared/constants'

import { Cauldron } from '../typechain/Cauldron'
import { Timelock } from '../typechain/Timelock'
import { FYToken } from '../typechain/FYToken'

(async () => {
  const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
  const fyTokens = jsonToMap(fs.readFileSync('./output/fyTokens.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron

  for (let [seriesId, fyTokenAddress] of fyTokens) {
    const fyToken = await ethers.getContractAt('FYToken', fyTokenAddress as string, ownerAcc) as unknown as FYToken
    if ((await fyToken.chiAtMaturity()).eq(NOT_MATURE)) console.log(`${bytesToString(seriesId)}(${fyTokenAddress}): Not mature`)
    else console.log(`${bytesToString(seriesId)}(${fyTokenAddress}): chi ${await fyToken.callStatic.accrual()} | rate ${await cauldron.callStatic.accrual(seriesId)}`)
  }
})()