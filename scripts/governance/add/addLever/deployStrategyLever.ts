import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, writeAddressMap, verify } from '../../../../shared/helpers'

import YieldStrategyLeverArtifact from '../../../../artifacts/contracts/YieldStrategyLever.sol/YieldStrategyLever.json'
import { YieldStrategyLever } from '../../../../typechain'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the YieldStrategyLever
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(deployer)

  let yieldStrategyLever: YieldStrategyLever

  if (protocol.get('yieldStrategyLever') === undefined) {
    yieldStrategyLever = (await deployContract(ownerAcc, YieldStrategyLeverArtifact, [
      protocol.get('giver'),
    ])) as YieldStrategyLever
    console.log(`YieldStrategyLever deployed at ${yieldStrategyLever.address}`)
    verify(yieldStrategyLever.address, [protocol.get('giver')])
    protocol.set('yieldStrategyLever', yieldStrategyLever.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yieldStrategyLever = (await ethers.getContractAt(
      'YieldStrategyLever',
      protocol.get('yieldStrategyLever') as string,
      ownerAcc
    )) as unknown as YieldStrategyLever
    console.log(`Reusing YieldStrategyLever at ${yieldStrategyLever.address}`)
  }

  return yieldStrategyLever
})()
