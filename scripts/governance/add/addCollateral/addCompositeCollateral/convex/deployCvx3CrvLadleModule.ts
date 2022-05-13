import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
  bytesToBytes32,
} from '../../../../../../shared/helpers'

import { ROOT } from '../../../../../../shared/constants'
import ConvexLadleModuleArtifact from '../../../../../../artifacts/@yield-protocol/vault-v2/contracts/other/convex/ConvexModule.sol/ConvexModule.json'

import { ConvexModule } from '../../../../../../typechain/ConvexModule'
import { Timelock } from '../../../../../../typechain/Timelock'
import { Cauldron } from '../../../../../../typechain'
const { developer } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the ConvexLadleModule.
 *
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  let convexLadleModule: ConvexModule

  if (protocol.get('convexLadleModule') === undefined) {
    convexLadleModule = (await deployContract(ownerAcc, ConvexLadleModuleArtifact, [
      cauldron.address,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', //WETH,
    ])) as ConvexModule
    console.log(`convexLadleModule deployed at ${convexLadleModule.address}`)
    verify(convexLadleModule.address, [cauldron.address, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'])
    protocol.set('convexLadleModule', convexLadleModule.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    convexLadleModule = (await ethers.getContractAt(
      'ConvexModule',
      protocol.get('convexLadleModule') as string,
      ownerAcc
    )) as unknown as ConvexModule
    console.log(`Reusing convexLadleModule at ${convexLadleModule.address}`)
  }
  // if (!(await convexLadleModule.hasRole(ROOT, timelock.address))) {
  //   await convexLadleModule.grantRole(ROOT, timelock.address)
  //   console.log(`convexLadleModule.grantRoles(ROOT, timelock)`)
  //   while (!(await convexLadleModule.hasRole(ROOT, timelock.address))) {}
  // }
})()
