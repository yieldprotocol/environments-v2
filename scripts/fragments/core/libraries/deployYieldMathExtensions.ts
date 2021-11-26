import { ethers } from 'hardhat'
import * as fs from 'fs'
import { verify, readAddressMappingIfExists, writeAddressMap, getAddressMappingFilePath, getOriginalChainId, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { YieldMath, YieldMathExtensions } from '../../../../typechain'

/**
 * @dev This script deploys the YieldMathExtensions libraries
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');

  const  yieldMath = (await ethers.getContractAt('YieldMath', protocol.get('yieldMath') as string, ownerAcc)) as YieldMath

  let yieldMathExtensions: YieldMathExtensions
  if (protocol.get('yieldMathExtensions') === undefined) {
    const YieldMathExtensionsFactory = await ethers.getContractFactory('YieldMathExtensions', {
      libraries: {
        YieldMath: yieldMath.address,
      },
    })
    yieldMathExtensions = (await YieldMathExtensionsFactory.deploy()) as unknown as YieldMathExtensions
    await yieldMathExtensions.deployed()
    console.log(`YieldMathExtensions deployed at ${yieldMathExtensions.address}`)
    verify(yieldMathExtensions.address, [], getAddressMappingFilePath('yieldMath.js'))
    protocol.set('yieldMathExtensions', yieldMathExtensions.address)
    writeAddressMap("protocol.json", protocol);
    fs.writeFileSync(
      getAddressMappingFilePath('yieldMathExtensions.js'),
      `module.exports = { YieldMathExtensions: "${yieldMathExtensions.address}" }`,
      'utf8'
    )
  } else {
    yieldMathExtensions = (await ethers.getContractAt(
      'YieldMathExtensions',
      protocol.get('yieldMathExtensions') as string,
      ownerAcc
    )) as YieldMathExtensions
    console.log(`Reusing YieldMathExtensions at ${yieldMathExtensions.address}`)
  }
})()
