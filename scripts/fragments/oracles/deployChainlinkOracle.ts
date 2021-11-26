import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'

import { ChainlinkMultiOracle } from '../../../typechain/ChainlinkMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the CompositeMultiOracles
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
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

  let chainlinkOracle: ChainlinkMultiOracle
  if (protocol.get('chainlinkOracle') === undefined) {
      chainlinkOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as ChainlinkMultiOracle
      console.log(`ChainlinkMultiOracle deployed at ${chainlinkOracle.address}`)
      verify(chainlinkOracle.address, [])
      protocol.set('chainlinkOracle', chainlinkOracle.address)
      writeAddressMap("protocol.json", protocol);
  } else {
      chainlinkOracle = (await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc)) as unknown as ChainlinkMultiOracle
      console.log(`Reusing ChainlinkMultiOracle at ${chainlinkOracle.address}`)
  }
  if (!(await chainlinkOracle.hasRole(ROOT, timelock.address))) {
      await chainlinkOracle.grantRole(ROOT, timelock.address); console.log(`chainlinkOracle.grantRoles(ROOT, timelock)`)
      while (!(await chainlinkOracle.hasRole(ROOT, timelock.address))) { }
  }
})()
