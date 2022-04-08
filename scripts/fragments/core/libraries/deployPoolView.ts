import { ethers } from 'hardhat'
import { verify, writeAddressMap, getAddressMappingFilePath } from '../../../../shared/helpers'
import { PoolView, YieldMathExtensions } from '../../../../typechain'

/**
 * @dev This script deploys the PoolView library
 */
export const deployPoolView = async (
  ownerAcc: any,
  yieldMathExtensions: YieldMathExtensions,
  protocol: Map<string, string>
): Promise<PoolView> => {
  let poolView: PoolView
  if (protocol.get('poolView') === undefined) {
    const PoolViewFactory = await ethers.getContractFactory('PoolView', {
      libraries: {
        YieldMathExtensions: yieldMathExtensions.address,
      },
    })
    poolView = await PoolViewFactory.deploy()
    await poolView.deployed()
    console.log(`PoolView deployed at ${poolView.address}`)
    verify(poolView.address, [], getAddressMappingFilePath('yieldMathExtensions.js'))
    protocol.set('poolView', poolView.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    poolView = await ethers.getContractAt('PoolView', protocol.get('poolView') as string, ownerAcc)
    console.log(`Reusing PoolView at ${poolView.address}`)
  }

  return poolView
}
