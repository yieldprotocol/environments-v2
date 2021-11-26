import { ethers } from 'hardhat'
import { verify, readAddressMappingIfExists, writeAddressMap, getAddressMappingFilePath, getOriginalChainId, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { YieldMathExtensions } from '../../../../typechain/YieldMathExtensions'
import { PoolView } from '../../../../typechain/PoolView'

/**
 * @dev This script deploys the PoolView library
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

  const yieldMathExtensions = (await ethers.getContractAt(
    'YieldMathExtensions',
    protocol.get('yieldMathExtensions') as string,
    ownerAcc
  )) as YieldMathExtensions

  let poolView: PoolView
  if (protocol.get('poolView') === undefined) {
    const PoolViewFactory = await ethers.getContractFactory('PoolView', {
      libraries: {
        YieldMathExtensions: yieldMathExtensions.address,
      },
    })
    poolView = (await PoolViewFactory.deploy()) as unknown as PoolView
    await poolView.deployed()
    console.log(`PoolView deployed at ${poolView.address}`)
    verify(poolView.address, [], getAddressMappingFilePath('yieldMathExtensions.js'))
    protocol.set('poolView', poolView.address)
    writeAddressMap("protocol.json", protocol);
  } else {
    poolView = (await ethers.getContractAt('PoolView', protocol.get('poolView') as string, ownerAcc)) as PoolView
    console.log(`Reusing PoolView at ${poolView.address}`)
  }
})()
