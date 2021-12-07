import { ethers } from 'hardhat'
import { readAddressMappingIfExists, bytesToBytes32, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { IOracle } from '../../../../typechain'

import { DAI, USDC, ETH, YVUSDC, WAD } from '../../../../shared/constants'
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

  console.log(`YVUSDC/ETH: ${await yearnOracle.peek(bytesToBytes32(YVUSDC), bytesToBytes32(ETH), WAD)}`)
  console.log(`ETH/YVUSDC: ${await yearnOracle.peek(bytesToBytes32(ETH), bytesToBytes32(YVUSDC), WAD)}`)
  console.log(`YVUSDC/DAI: ${await compositeOracle.peek(bytesToBytes32(YVUSDC), bytesToBytes32(DAI), WAD)}`)
  console.log(`DAI/YVUSDC: ${await compositeOracle.peek(bytesToBytes32(DAI), bytesToBytes32(YVUSDC), WAD)}`)
  console.log(`YVUSDC/USDC: ${await compositeOracle.peek(bytesToBytes32(YVUSDC), bytesToBytes32(USDC), WAD)}`)
  console.log(`USDC/YVUSDC: ${await compositeOracle.peek(bytesToBytes32(USDC), bytesToBytes32(YVUSDC), WAD)}`)
})()
