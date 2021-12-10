import { ethers, waffle } from 'hardhat'
import { ROOT } from '../../../shared/constants'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'

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

;(async () => {
  const chainId = await getOriginalChainId()

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let compositeOracle: CompositeMultiOracle
  if (protocol.get('compositeOracle') === undefined) {
      compositeOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as CompositeMultiOracle
      console.log(`CompositeMultiOracle deployed at ${compositeOracle.address}`)
      verify(compositeOracle.address, [])
      protocol.set('compositeOracle', compositeOracle.address)
      writeAddressMap("protocol.json", protocol);
  } else {
      compositeOracle = (await ethers.getContractAt('CompositeMultiOracle', protocol.get('compositeOracle') as string, ownerAcc)) as unknown as CompositeMultiOracle
      console.log(`Reusing CompositeMultiOracle at ${compositeOracle.address}`)
  }
  if (!(await compositeOracle.hasRole(ROOT, timelock.address))) {
      await compositeOracle.grantRole(ROOT, timelock.address); console.log(`compositeOracle.grantRoles(ROOT, timelock)`)
      while (!(await compositeOracle.hasRole(ROOT, timelock.address))) { }
  }
})()
