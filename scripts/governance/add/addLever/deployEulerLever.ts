import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../shared/helpers'

import YieldEulerLeverArtifact from '../../../../artifacts/contracts/YieldEulerLever.sol/YieldEulerLever.json'
import { YieldEulerLever } from '../../../../typechain'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the YieldEulerLever
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)

  let yieldEulerLever: YieldEulerLever

  if (protocol.get('yieldEulerLever') === undefined) {
    yieldEulerLever = (await deployContract(ownerAcc, YieldEulerLeverArtifact, [
      'ilkid',
      'baseid',
      protocol.get('giver'),
    ])) as YieldEulerLever
    console.log(`YieldEulerLever deployed at ${yieldEulerLever.address}`)
    verify(yieldEulerLever.address, ['ilkid', 'baseid', protocol.get('giver')])
    protocol.set('yieldEulerLever', yieldEulerLever.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yieldEulerLever = (await ethers.getContractAt(
      'YieldEulerLever',
      protocol.get('yieldEulerLever') as string,
      ownerAcc
    )) as unknown as YieldEulerLever
    console.log(`Reusing yieldEulerLever at ${yieldEulerLever.address}`)
  }

  return yieldEulerLever
})()
