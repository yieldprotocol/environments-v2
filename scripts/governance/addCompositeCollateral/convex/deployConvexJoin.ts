import { ethers, waffle } from 'hardhat'
import { getOwnerOrImpersonate, readAddressMappingIfExists, verify, writeAddressMap } from '../../../../shared/helpers'
import { ROOT } from '../../../../shared/constants'

import ConvexJoinArtifact from '../../../../artifacts/@yield-protocol/vault-v2/contracts/other/convex/ConvexJoin.sol/ConvexJoin.json'

import { ERC20Mock, ConvexJoin} from '../../../../typechain'
import { CVX3CRV } from '../../../../shared/constants'

const { deployContract } = waffle
const { developer, cvxBaseRewardPool, crv, cvx3CrvAddress } = require(process.env.CONF as string)
const { governance,protocol } = require(process.env.BASE as string)
/**
 * @dev This script deploys the ConvexJoin
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = governance.get('timelock') as string
  let joins: Map<string, string> = new Map()
  
  let join: ConvexJoin
  
  const convex = (await ethers.getContractAt(
    'contracts/::mocks/ERC20Mock.sol:ERC20Mock',
    cvx3CrvAddress,
    ownerAcc
  )) as unknown as ERC20Mock

  
  let args = [crv, cvx3CrvAddress, cvxBaseRewardPool, 0,protocol.get('cauldron') as string, await convex.name(), await convex.symbol(), await convex.decimals()]
  
  join = (await deployContract(ownerAcc, ConvexJoinArtifact, args)) as ConvexJoin
  console.log(`Join deployed at ${join.address} for ${cvx3CrvAddress}`)
  verify(join.address, args)

  if (!(await join.hasRole(ROOT, timelock))) {
    await join.grantRole(ROOT, timelock)
    console.log(`join.grantRoles(ROOT, timelock)`)
    while (!(await join.hasRole(ROOT, timelock))) {}
  }

  joins.set(CVX3CRV, join.address)
  writeAddressMap('newJoins.json', joins)
})()
