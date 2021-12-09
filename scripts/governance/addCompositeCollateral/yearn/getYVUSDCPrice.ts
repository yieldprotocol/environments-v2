import { ethers } from 'hardhat'
import { readAddressMappingIfExists, bytesToBytes32, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { IOracle } from '../../../../typechain'

import { DAI, USDC, ETH, YVUSDC, WAD, ONEUSDC } from '../../../../shared/constants'
import { developer } from './addYVUSDC.rinkeby.config'

/**
 * @dev This script reads YVUSDC/ETH, YVUSDC/DAI and YVUSDC/USDC prices
 */
;(async () => {
   const chainId = await getOriginalChainId()
   if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"
 
   let ownerAcc = await getOwnerOrImpersonate(developer, WAD)
 
   const protocol = readAddressMappingIfExists('protocol.json');

  const compositeOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as IOracle
  const yearnOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get('yearnOracle') as string,
    ownerAcc
  )) as unknown as IOracle

  console.log(`YVUSDC/USDC: ${await yearnOracle.peek(bytesToBytes32(YVUSDC), bytesToBytes32(USDC), ONEUSDC)}`)
  console.log(`USDC/YVUSDC: ${await yearnOracle.peek(bytesToBytes32(USDC), bytesToBytes32(YVUSDC), ONEUSDC)}`)
  console.log(`YVUSDC/DAI: ${await compositeOracle.peek(bytesToBytes32(YVUSDC), bytesToBytes32(DAI), ONEUSDC)}`)
  console.log(`DAI/YVUSDC: ${await compositeOracle.peek(bytesToBytes32(DAI), bytesToBytes32(YVUSDC), WAD)}`)
  console.log(`YVUSDC/ETH: ${await compositeOracle.peek(bytesToBytes32(YVUSDC), bytesToBytes32(ETH), ONEUSDC)}`)
  console.log(`ETH/YVUSDC: ${await compositeOracle.peek(bytesToBytes32(ETH), bytesToBytes32(YVUSDC), WAD)}`)
})()
