import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
  bytesToBytes32,
} from '../../../shared/helpers'
import { WSTETH, STETH, CVX3CRV } from '../../../shared/constants'
import ConvexStakingWrapperYieldArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/utils/convex/ConvexStakingWrapperYield.sol/ConvexStakingWrapperYield.json'

import { ConvexStakingWrapperYield } from '../../../typechain/ConvexStakingWrapperYield'
import { Timelock } from '../../../typechain/Timelock'
import { Cauldron, Join, Ladle } from '../../../typechain'
import { developer } from '../../governance/addCompositeCollateral/convex/addCvx3Crv.config'
const { deployContract } = waffle

/**
 * @dev This script deploys the cvx3Crvwrapper
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

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
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle

  let convexStakingWrapperYield: ConvexStakingWrapperYield
  if (protocol.get('convexStakingWrapperYield') === undefined) {
    const join = (await ethers.getContractAt('Join', await ladle.joins(CVX3CRV), ownerAcc)) as Join
    convexStakingWrapperYield = (await deployContract(ownerAcc, ConvexStakingWrapperYieldArtifact, [
      '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490', // curveToken_,
      '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c', // convexToken_,
      '0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8', // convexPool_,
      9, // poolId_,
      join.address, // join_,
      cauldron.address,
      timelock.address,
    ])) as ConvexStakingWrapperYield
    console.log(`convexStakingWrapperYield deployed at ${convexStakingWrapperYield.address}`)
    verify(convexStakingWrapperYield.address, [
      '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
      '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c',
      '0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8',
      9,
      '0x0000000000000000000000000000000000000000',
      cauldron.address,
      timelock.address,
    ])
    protocol.set('convexStakingWrapperYield', convexStakingWrapperYield.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    convexStakingWrapperYield = (await ethers.getContractAt(
      'convexStakingWrapperYield',
      protocol.get('convexStakingWrapperYield') as string,
      ownerAcc
    )) as unknown as ConvexStakingWrapperYield
    console.log(`Reusing convexStakingWrapperYield at ${convexStakingWrapperYield.address}`)
  }
})()
