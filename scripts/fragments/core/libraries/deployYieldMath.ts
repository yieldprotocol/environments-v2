import { ethers } from 'hardhat'
import { verify, writeAddressMap, getAddressMappingFilePath } from '../../../../shared/helpers'

import { YieldMath } from '../../../../typechain/YieldMath'

/**
 * @dev This script deploys the YieldMath library
 */
export const deployYieldMath = async (
  ownerAcc: any,
  protocol: Map<string, string>,
): Promise<YieldMath> => {
  let yieldMath: YieldMath
  if (protocol.get('yieldMath') === undefined) {
    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = (await YieldMathFactory.deploy()) as unknown as YieldMath
    await yieldMath.deployed()
    console.log(`YieldMath deployed at ${yieldMath.address}`)
    verify(yieldMath.address, [])
    protocol.set('yieldMath', yieldMath.address)
    writeAddressMap("protocol.json", protocol);
  } else {
    yieldMath = (await ethers.getContractAt('YieldMath', protocol.get('yieldMath') as string, ownerAcc)) as YieldMath
    console.log(`Reusing YieldMath at ${yieldMath.address}`)
  }

  return yieldMath
}
