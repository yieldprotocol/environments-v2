import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  verify,
  writeAddressMap,
} from '../../../../../../../shared/helpers'

import ConvexYieldWrapperMockArtifact from '../../../../../../../artifacts/contracts/mocks/ConvexYieldWrapperMock.sol/ConvexYieldWrapperMock.json'
import { ConvexYieldWrapperMock } from '../../../../../../../typechain/ConvexYieldWrapperMock'
import { CVX3CRV, ROOT } from '../../../../../../../shared/constants'
import { Ladle, Join } from '../../../../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the ConvexYieldWrapperMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy ConvexYieldWrapperMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  let convexYieldWrapperMock: ConvexYieldWrapperMock
  if (protocol.get('convexYieldWrapper') === undefined) {
    const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
    const join = (await ethers.getContractAt('Join', await ladle.joins(CVX3CRV), ownerAcc)) as Join

    const args = [
      protocol.get('cvx3CrvMock') as string,
      protocol.get('convexPoolMock') as string,
      0,
      join.address,
      protocol.get('cauldron') as string,
      protocol.get('crvMock') as string,
      protocol.get('cvxMock') as string,
    ]

    convexYieldWrapperMock = (await deployContract(
      ownerAcc,
      ConvexYieldWrapperMockArtifact,
      args
    )) as ConvexYieldWrapperMock
    console.log(`ConvexYieldWrapperMock deployed at '${convexYieldWrapperMock.address}`)
    verify(convexYieldWrapperMock.address, args)
    protocol.set('convexYieldWrapper', convexYieldWrapperMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    convexYieldWrapperMock = (await ethers.getContractAt(
      'ConvexYieldWrapperMock',
      protocol.get('convexYieldWrapper') as string,
      ownerAcc
    )) as unknown as ConvexYieldWrapperMock
    console.log(`Reusing convexYieldWrapper at ${convexYieldWrapperMock.address}`)
  }

  if (!(await convexYieldWrapperMock.hasRole(ROOT, governance.get('timelock') as string))) {
    await convexYieldWrapperMock.grantRole(ROOT, governance.get('timelock') as string)
    console.log(`convexYieldWrapperMock.grantRoles(ROOT, timelock)`)
    while (!(await convexYieldWrapperMock.hasRole(ROOT, governance.get('timelock') as string))) {}
  }
})()
