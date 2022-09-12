import { ethers } from 'hardhat'
import { verify, writeAddressMap, getAddressMappingFilePath } from '../../../../shared/helpers'
import { YieldMath } from '../../../../typechain'
/**
 * @dev This script deploys the YieldMath library
 */
export const deployYieldMath = async (ownerAcc: any, protocol: Map<string, string>): Promise<YieldMath> => {
  let yieldMath: YieldMath
  if (protocol.get('yieldMath') === undefined) {
    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = await YieldMathFactory.deploy({ gasLimit: 100_000_000 })
    await yieldMath.deployed()
    console.log(`YieldMath deployed at ${yieldMath.address}`)
    verify(yieldMath.address, [])
  } else {
    yieldMath = await ethers.getContractAt('YieldMath', protocol.get('yieldMath') as string, ownerAcc)
    console.log(`Reusing YieldMath at ${yieldMath.address}`)
  }

  return yieldMath
}
