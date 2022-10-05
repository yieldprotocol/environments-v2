import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../shared/helpers'

import YieldStEthLeverArtifact from '../../../../artifacts/contracts/YieldStEthLever.sol/YieldStEthLever.json'
import { YieldStEthLever } from '../../../../typechain'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the YieldStEthLever
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)

  let yieldStEthLever: YieldStEthLever
  if (protocol.get('yieldStEthLever') === undefined) {
    yieldStEthLever = (await deployContract(ownerAcc, YieldStEthLeverArtifact, [
      protocol.get('giver'),
    ])) as YieldStEthLever
    console.log(`YieldStEthLever deployed at ${yieldStEthLever.address}`)
    verify(yieldStEthLever.address, [protocol.get('giver')])
    protocol.set('yieldStEthLever', yieldStEthLever.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yieldStEthLever = (await ethers.getContractAt(
      'YieldStEthLever',
      protocol.get('yieldStEthLever') as string,
      ownerAcc
    )) as unknown as YieldStEthLever
    console.log(`Reusing YieldStEthLever at ${yieldStEthLever.address}`)
  }

  return yieldStEthLever
})()
