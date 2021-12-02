import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'

import { ChainlinkMultiOracle } from '../../../typechain/ChainlinkMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ChainlinkMultiOracle
 */

;(async () => {
  const chainId = await getOriginalChainId()

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
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
