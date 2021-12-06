import { ethers } from 'hardhat'
import * as fs from 'fs'
import { verify, readAddressMappingIfExists, writeAddressMap, getAddressMappingFilePath, getOriginalChainId, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { SafeERC20Namer } from '../../../../typechain/SafeERC20Namer'

/**
 * @dev This script deploys the SafeERC20Namer library
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');

  let safeERC20Namer: SafeERC20Namer
  if (protocol.get('safeERC20Namer') === undefined) {
    const SafeERC20NamerFactory = await ethers.getContractFactory('SafeERC20Namer')
    safeERC20Namer = (await SafeERC20NamerFactory.deploy()) as unknown as SafeERC20Namer
    await safeERC20Namer.deployed()
    console.log(`SafeERC20Namer deployed at ${safeERC20Namer.address}`)
    verify(safeERC20Namer.address, [])
    protocol.set('safeERC20Namer', safeERC20Namer.address)
    writeAddressMap("protocol.json", protocol);
    fs.writeFileSync(getAddressMappingFilePath('safeERC20Namer.js'), `module.exports = { SafeERC20Namer: "${safeERC20Namer.address}" }`, 'utf8')
  } else {
    safeERC20Namer = (await ethers.getContractAt(
      'SafeERC20Namer',
      protocol.get('safeERC20Namer') as string,
      ownerAcc
    )) as SafeERC20Namer
    console.log(`Reusing SafeERC20Namer at ${safeERC20Namer.address}`)
  }
})()
