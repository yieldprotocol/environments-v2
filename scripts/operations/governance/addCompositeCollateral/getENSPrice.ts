import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, bytesToBytes32, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { IOracle } from '../../../../typechain'

import { DAI, USDC, ETH, ENS, WAD } from '../../../../shared/constants'

/**
 * @dev This script reads ENS/ETH, ENS/DAI and ENS/USDC prices
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  
  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>

  const compositeOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as IOracle
  const uniswapOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get('uniswapOracle') as string,
    ownerAcc
  )) as unknown as IOracle

  console.log(`ENS/ETH: ${await uniswapOracle.peek(bytesToBytes32(ENS), bytesToBytes32(ETH), WAD)}`)
  console.log(`ETH/ENS: ${await uniswapOracle.peek(bytesToBytes32(ETH), bytesToBytes32(ENS), WAD)}`)
  console.log(`ENS/DAI: ${await compositeOracle.peek(bytesToBytes32(ENS), bytesToBytes32(DAI), WAD)}`)
  console.log(`DAI/ENS: ${await compositeOracle.peek(bytesToBytes32(DAI), bytesToBytes32(ENS), WAD)}`)
  console.log(`ENS/USDC: ${await compositeOracle.peek(bytesToBytes32(ENS), bytesToBytes32(USDC), WAD)}`)
  console.log(`USDC/ENS: ${await compositeOracle.peek(bytesToBytes32(USDC), bytesToBytes32(ENS), WAD)}`)
})()
