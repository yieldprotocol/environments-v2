import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, verify, writeAddressMap } from '../../../../../shared/helpers'

import ConvexStakingWrapperYieldMockArtifact from '../../../../../artifacts/contracts/mocks/ConvexStakingWrapperYieldMock.sol/ConvexStakingWrapperYieldMock.json'
import { ConvexStakingWrapperYieldMock } from '../../../../../typechain/ConvexStakingWrapperYieldMock'
import { CVX3CRV, ROOT } from '../../../../../shared/constants'
import { Ladle, Join } from '../../../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the ConvexStakingWrapperYieldMock contract
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId === 1) throw "You shouldn't deploy ConvexStakingWrapperYieldMock on mainnet"
  const [ownerAcc] = await ethers.getSigners()
  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  let convexStakingWrapperYieldMock: ConvexStakingWrapperYieldMock
  if (protocol.get('convexStakingWrapperYield') === undefined) {
    const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
    const join = (await ethers.getContractAt('Join', await ladle.joins(CVX3CRV), ownerAcc)) as Join

    const args = [
      protocol.get('cvx3CrvMock') as string,
      protocol.get('convexPoolMock') as string,
      0,
      join.address,
      protocol.get('cauldron') as string,
      protocol.get('crvMock') as string,
      protocol.get('cvx3CrvMock') as string,
    ]

    convexStakingWrapperYieldMock = (await deployContract(
      ownerAcc,
      ConvexStakingWrapperYieldMockArtifact
    )) as ConvexStakingWrapperYieldMock
    console.log(`ConvexStakingWrapperYieldMock deployed at '${convexStakingWrapperYieldMock.address}`)
    verify(convexStakingWrapperYieldMock.address, [])
    protocol.set('convexStakingWrapperYield', convexStakingWrapperYieldMock.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    convexStakingWrapperYieldMock = (await ethers.getContractAt(
      'ConvexStakingWrapperYieldMock',
      protocol.get('convexStakingWrapperYield') as string,
      ownerAcc
    )) as unknown as ConvexStakingWrapperYieldMock
    console.log(`Reusing convexStakingWrapperYield at ${convexStakingWrapperYieldMock.address}`)
  }

  if (!(await convexStakingWrapperYieldMock.hasRole(ROOT, governance.get('timelock') as string))) {
    await convexStakingWrapperYieldMock.grantRole(ROOT, governance.get('timelock') as string)
    console.log(`convexStakingWrapperYieldMock.grantRoles(ROOT, timelock)`)
    while (!(await convexStakingWrapperYieldMock.hasRole(ROOT, governance.get('timelock') as string))) {}
  }
})()
