import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  bytesToBytes32,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'

import { IOracle } from '../../../../typechain'

import { DAI, USDC, ETH, YVUSDC, WAD, ONEUSDC } from '../../../../shared/constants'
import { developer } from './addYVUSDC.mainnet.config'

/**
 * @dev This script reads YVUSDC/ETH, YVUSDC/DAI and YVUSDC/USDC prices
 */
;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)

  const protocol = readAddressMappingIfExists('protocol.json')

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
})()
