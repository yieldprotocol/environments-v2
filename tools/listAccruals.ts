/**
 * @dev This script cancels the debt from a number of vaults.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { jsonToMap, getName } from '../../shared/helpers'
import { MAX256 as NOT_MATURE } from '../../shared/constants'

import { Cauldron } from '../../typechain/Cauldron'
import { Timelock } from '../../typechain/Timelock'
import { FYToken } from '../../typechain/FYToken'
;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const fyTokens = jsonToMap(fs.readFileSync('./addresses/fyTokens.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  console.log('\nRate:')
  for (let [seriesId, fyTokenAddress] of fyTokens) {
    if ((await cauldron.ratesAtMaturity(seriesId)).eq(BigNumber.from(0)))
      console.log(`${getName(seriesId)}(${fyTokenAddress}): Not mature`)
    else
      console.log(
        `${getName(seriesId)}(${fyTokenAddress}): accrual ${await cauldron.callStatic.accrual(
          seriesId
        )}, at maturity ${await cauldron.ratesAtMaturity(seriesId)}`
      )
  }

  console.log('\nChi:')
  for (let [seriesId, fyTokenAddress] of fyTokens) {
    const fyToken = (await ethers.getContractAt('FYToken', fyTokenAddress as string, ownerAcc)) as unknown as FYToken
    if ((await fyToken.chiAtMaturity()).eq(NOT_MATURE))
      console.log(`${getName(seriesId)}(${fyTokenAddress}): Not mature`)
    else
      console.log(
        `${getName(
          seriesId
        )}(${fyTokenAddress}): accrual ${await fyToken.callStatic.accrual()}, at maturity ${await fyToken.chiAtMaturity()}`
      )
  }
})()
