import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CompoundMultiOracle.sol/CompoundMultiOracle.json'

import { CompoundMultiOracle } from '../../../typechain/CompoundMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CompositeMultiOracles
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
  
  let compoundOracle: CompoundMultiOracle
  if (protocol.get('compoundOracle') === undefined) {
      compoundOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as CompoundMultiOracle
      console.log(`CompoundMultiOracle deployed at ${compoundOracle.address}`)
      verify(compoundOracle.address, [])
      protocol.set('compoundOracle', compoundOracle.address)
      writeAddressMap("protocol.json", protocol);
  } else {
      compoundOracle = (await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc)) as unknown as CompoundMultiOracle
      console.log(`Reusing CompoundMultiOracle at ${compoundOracle.address}`)
  }
  if (!(await compoundOracle.hasRole(ROOT, timelock.address))) {
      await compoundOracle.grantRole(ROOT, timelock.address); console.log(`compoundOracle.grantRoles(ROOT, timelock)`)
      while (!(await compoundOracle.hasRole(ROOT, timelock.address))) { }
  }
})()
