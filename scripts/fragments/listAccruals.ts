/**
 * @dev This script cancels the debt from a number of vaults.
 *
 * It takes as inputs the governance and protocol address files.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { jsonToMap, bytesToString } from '../../shared/helpers'
import { MAX256 as NOT_MATURE } from '../../shared/constants'
;(async () => {
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const fyTokens = jsonToMap(fs.readFileSync('./addresses/fyTokens.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)

  console.log('\nRate:')
  for (let [seriesId, fyTokenAddress] of fyTokens) {
    if ((await cauldron.ratesAtMaturity(seriesId)).eq(BigNumber.from(0)))
      console.log(`${bytesToString(seriesId)}(${fyTokenAddress}): Not mature`)
    else
      console.log(
        `${bytesToString(seriesId)}(${fyTokenAddress}): accrual ${await cauldron.callStatic.accrual(
          seriesId
        )}, at maturity ${await cauldron.ratesAtMaturity(seriesId)}`
      )
  }

  console.log('\nChi:')
  for (let [seriesId, fyTokenAddress] of fyTokens) {
    const fyToken = await ethers.getContractAt('FYToken', fyTokenAddress as string, ownerAcc)
    if ((await fyToken.chiAtMaturity()).eq(NOT_MATURE))
      console.log(`${bytesToString(seriesId)}(${fyTokenAddress}): Not mature`)
    else
      console.log(
        `${bytesToString(
          seriesId
        )}(${fyTokenAddress}): accrual ${await fyToken.callStatic.accrual()}, at maturity ${await fyToken.chiAtMaturity()}`
      )
  }
})()
