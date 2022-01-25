import { ethers } from 'hardhat'
import * as fs from 'fs'
import { verify, readAddressMappingIfExists, writeAddressMap, getAddressMappingFilePath, getOriginalChainId, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { SafeERC20Namer } from '../../../../typechain/SafeERC20Namer'

/**
 * @dev This script deploys the SafeERC20Namer library
 */
export const deploySafeERC20Namer = async (
  ownerAcc: any,
  protocol: Map<string, string>,
): Promise<SafeERC20Namer> => {
  let safeERC20Namer: SafeERC20Namer
  if (protocol.get('safeERC20Namer') === undefined) {
    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20Namer = (await SafeERC20NamerFactory.deploy()) as unknown as SafeERC20Namer
    await safeERC20Namer.deployed()
    console.log(`SafeERC20Namer deployed at ${safeERC20Namer.address}`)
    verify(safeERC20Namer.address, [])
    protocol.set('safeERC20Namer', safeERC20Namer.address)
    writeAddressMap("protocol.json", protocol);
  } else {
    safeERC20Namer = (await ethers.getContractAt('SafeERC20Namer', protocol.get('safeERC20Namer') as string, ownerAcc)) as SafeERC20Namer
    console.log(`Reusing SafeERC20Namer at ${safeERC20Namer.address}`)
  }

  return safeERC20Namer
}
