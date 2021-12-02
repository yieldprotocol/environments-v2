import { ethers } from 'hardhat'
import * as fs from 'fs'
import { verify, readAddressMappingIfExists, writeAddressMap, getAddressMappingFilePath, getOriginalChainId, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { YieldMath } from '../../../../typechain/YieldMath'

/**
 * @dev This script deploys the YieldMath library
 */

;(async () => {
  const chainId = await getOriginalChainId()

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');

  let yieldMath: YieldMath
  if (protocol.get('yieldMath') === undefined) {
    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = (await YieldMathFactory.deploy()) as unknown as YieldMath
    await yieldMath.deployed()
    console.log(`YieldMath deployed at ${yieldMath.address}`)
    verify(yieldMath.address, [])
    protocol.set('yieldMath', yieldMath.address)
    writeAddressMap("protocol.json", protocol);
    fs.writeFileSync(getAddressMappingFilePath('yieldMath.js'), `module.exports = { YieldMath: "${yieldMath.address}" }`, 'utf8')
  } else {
    yieldMath = (await ethers.getContractAt('YieldMath', protocol.get('yieldMath') as string, ownerAcc)) as YieldMath
    console.log(`Reusing YieldMath at ${yieldMath.address}`)
  }
})()
