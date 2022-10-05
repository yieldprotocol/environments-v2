import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../shared/helpers'

import YieldNotionalLeverArtifact from '../../../../artifacts/contracts/YieldNotionalLever.sol/YieldNotionalLever.json'
import { YieldNotionalLever } from '../../../../typechain'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the YieldNotionalLever
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)

  let yieldNotionalLever: YieldNotionalLever

  if (protocol.get('yieldNotionalLever') === undefined) {
    yieldNotionalLever = (await deployContract(ownerAcc, YieldNotionalLeverArtifact, [
      protocol.get('giver'),
    ])) as YieldNotionalLever
    console.log(`YieldNotionalLever deployed at ${yieldNotionalLever.address}`)
    verify(yieldNotionalLever.address, [protocol.get('giver')])
    protocol.set('yieldNotionalLever', yieldNotionalLever.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yieldNotionalLever = (await ethers.getContractAt(
      'YieldNotionalLever',
      protocol.get('yieldNotionalLever') as string,
      ownerAcc
    )) as unknown as YieldNotionalLever
    console.log(`Reusing YieldNotionalLever at ${yieldNotionalLever.address}`)
  }

  return yieldNotionalLever
})()
