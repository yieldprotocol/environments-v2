import { ethers, waffle } from 'hardhat'
import { ROOT } from '../../../shared/constants'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/composite/CompositeMultiOracle.sol/CompositeMultiOracle.json'

import { CompositeMultiOracle } from '../../../typechain/CompositeMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CompositeMultiOracles
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */
export const deployCompositeOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<CompositeMultiOracle> => {
  let compositeOracle: CompositeMultiOracle
  if (protocol.get('compositeOracle') === undefined) {
    compositeOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as CompositeMultiOracle
    console.log(`CompositeMultiOracle deployed at ${compositeOracle.address}`)
    verify(compositeOracle.address, [])
    protocol.set('compositeOracle', compositeOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    compositeOracle = (await ethers.getContractAt(
      'CompositeMultiOracle',
      protocol.get('compositeOracle') as string,
      ownerAcc
    )) as unknown as CompositeMultiOracle
    console.log(`Reusing CompositeMultiOracle at ${compositeOracle.address}`)
  }
  if (!(await compositeOracle.hasRole(ROOT, timelock.address))) {
    await compositeOracle.grantRole(ROOT, timelock.address)
    console.log(`compositeOracle.grantRoles(ROOT, timelock)`)
    while (!(await compositeOracle.hasRole(ROOT, timelock.address))) {}
  }

  return compositeOracle
}
