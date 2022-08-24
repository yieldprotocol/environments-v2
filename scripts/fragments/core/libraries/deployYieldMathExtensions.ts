import { ethers } from 'hardhat'
import { verify, writeAddressMap, getAddressMappingFilePath } from '../../../../shared/helpers'

import { YieldMath, YieldMathExtensions } from '../../../../typechain'

/**
 * @dev This script deploys the YieldMathExtensions libraries
 */
export const deployYieldMathExtensions = async (
  ownerAcc: any,
  yieldMath: YieldMath,
  protocol: Map<string, string>
): Promise<YieldMathExtensions> => {
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
    verify(yieldMathExtensions.address, [], getAddressMappingFilePath('YieldMath.js'))
    protocol.set('yieldMathExtensions', yieldMathExtensions.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yieldMathExtensions = (await ethers.getContractAt(
      'YieldMathExtensions',
      protocol.get('yieldMathExtensions') as string,
      ownerAcc
    )) as YieldMathExtensions
    console.log(`Reusing YieldMathExtensions at ${yieldMathExtensions.address}`)
  }

  return yieldMathExtensions
}
