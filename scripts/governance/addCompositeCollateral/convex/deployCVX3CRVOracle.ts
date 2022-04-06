import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
  bytesToBytes32,
} from '../../../../shared/helpers'
import { WSTETH, STETH, CONVEX3CRV } from '../../../../shared/constants'
import { ROOT } from '../../../../shared/constants'
import Cvx3CrvOracleArtifact from '../../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/convex/Cvx3CrvOracle.sol/Cvx3CrvOracle.json'
import { Cvx3CrvOracle } from '../../../../typechain/Cvx3CrvOracle'
import { Timelock } from '../../../../typechain/Timelock'

const { developer } = require(process.env.CONF as string)
const { deployContract } = waffle

/**
 * @dev This script deploys the cvx3CrvOracle
 *
 * It takes as inputs the governance and protocol json address files.
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

  let cvx3CrvOracle: Cvx3CrvOracle
  if (protocol.get(CONVEX3CRV) === undefined) {
    cvx3CrvOracle = (await deployContract(ownerAcc, Cvx3CrvOracleArtifact)) as Cvx3CrvOracle
    console.log(`cvx3CrvOracle deployed at ${cvx3CrvOracle.address}`)

    verify(cvx3CrvOracle.address, [])
    protocol.set(CONVEX3CRV, cvx3CrvOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    cvx3CrvOracle = (await ethers.getContractAt(
      'Cvx3CrvOracle',
      protocol.get(CONVEX3CRV) as string,
      ownerAcc
    )) as unknown as Cvx3CrvOracle
    console.log(`Reusing cvx3CrvOracle at ${cvx3CrvOracle.address}`)
  }

  if (!(await cvx3CrvOracle.hasRole(ROOT, timelock.address))) {
    await cvx3CrvOracle.grantRole(ROOT, timelock.address)
    console.log(`cvx3CrvOracle.grantRoles(ROOT, timelock)`)
    while (!(await cvx3CrvOracle.hasRole(ROOT, timelock.address))) {}
  }
})()
