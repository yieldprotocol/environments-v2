import { ethers } from 'hardhat'
import { verify, writeAddressMap } from '../../../../shared/helpers'
import { YieldMath } from '../../../../typechain'

/**
 * @dev This script deploys the YieldMath library
 */
export const deployYieldMath = async (ownerAcc: any, protocol: Map<string, string>): Promise<YieldMath> => {
  let yieldMath: YieldMath
  if (protocol.get('yieldMath') === undefined) {
    const YieldMathFactory = await ethers.getContractFactory('YieldMath')
    yieldMath = await YieldMathFactory.deploy()
    await yieldMath.deployed()
    console.log(`YieldMath deployed at ${yieldMath.address}`)
    verify(yieldMath.address, [])
    protocol.set('yieldMath', yieldMath.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yieldMath = await ethers.getContractAt('YieldMath', protocol.get('yieldMath') as string, ownerAcc)
    console.log(`Reusing YieldMath at ${yieldMath.address}`)
  }

  return yieldMath
}
