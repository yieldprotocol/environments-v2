/**
 * @dev This script matures a series at the FYToken and/or Cauldron contracts.
 */

import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, stringToBytes6 } from '../../../shared/helpers'
import { MAX256 as NOT_MATURE } from '../../../shared/constants'

import { Cauldron } from '../../../typechain/Cauldron'
import { FYToken } from '../../../typechain/FYToken'

;(async () => {
  // Input data
  const seriesToMature: Array<string> = [
    // seriesId
    '0220',
  ]

  const [ownerAcc] = await ethers.getSigners()
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const fyTokens = jsonToMap(fs.readFileSync('./addresses/fyTokens.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  console.log('\nCauldron:')
  for (let seriesId of seriesToMature) {
    console.log(`Maturing in FYToken...`)
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      fyTokens.get(stringToBytes6(seriesId)) as string,
      ownerAcc
    )) as unknown as FYToken
    const chiAtMaturity = await fyToken.chiAtMaturity()
    if (chiAtMaturity.eq(NOT_MATURE)) {
      await fyToken.mature()
      while ((await fyToken.chiAtMaturity()).eq(NOT_MATURE)) {}
      console.log(`chi at maturity ${await fyToken.chiAtMaturity()}`)
    } else {
      console.log('already matured')
      console.log(`chi at maturity ${chiAtMaturity}`)
    }

    console.log(`Maturing in Cauldron...`)
    const rateAtMaturity = await cauldron.ratesAtMaturity(stringToBytes6(seriesId))
    if (rateAtMaturity.eq('0')) {
      await cauldron.mature(stringToBytes6(seriesId))
      while ((await cauldron.ratesAtMaturity(stringToBytes6(seriesId))).eq('0')) {}
      console.log(`rate at maturity ${await cauldron.ratesAtMaturity(stringToBytes6(seriesId))}`)
    } else {
      console.log('already matured')
      console.log(`rate at maturity ${rateAtMaturity}`)
    }
  }
})()
