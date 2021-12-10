import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
  bytesToBytes32,
} from '../../../shared/helpers'
import { WSTETH, STETH } from '../../../shared/constants'
import { ROOT } from '../../../shared/constants'
import ConvexLadleModuleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/utils/convex/ConvexLadleModule.sol/ConvexLadleModule.json'

import { ConvexLadleModule } from '../../../typechain/ConvexLadleModule'
import { Timelock } from '../../../typechain/Timelock'
import { Cauldron } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the ConvexLadleModule.
 *
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  
  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
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
  
  let convexLadleModule: ConvexLadleModule
  
  if (protocol.get('convexLadleModule') === undefined) {
    convexLadleModule = (await deployContract(ownerAcc, ConvexLadleModuleArtifact, [
      cauldron.address,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'//WETH,
    ])) as ConvexLadleModule
    console.log(`convexLadleModule deployed at ${convexLadleModule.address}`)
    verify(convexLadleModule.address, [cauldron.address,'0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'])
    protocol.set('convexLadleModule', convexLadleModule.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    convexLadleModule = (await ethers.getContractAt(
      'ConvexLadleModule',
      protocol.get('convexLadleModule') as string,
      ownerAcc
    )) as unknown as ConvexLadleModule
    console.log(`Reusing convexLadleModule at ${convexLadleModule.address}`)
  }
  // if (!(await convexLadleModule.hasRole(ROOT, timelock.address))) {
  //   await convexLadleModule.grantRole(ROOT, timelock.address)
  //   console.log(`convexLadleModule.grantRoles(ROOT, timelock)`)
  //   while (!(await convexLadleModule.hasRole(ROOT, timelock.address))) {}
  // }
})()
