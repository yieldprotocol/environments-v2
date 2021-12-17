import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import CompositeMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkUSDMultiOracle.sol/ChainlinkUSDMultiOracle.json'

import { ChainlinkUSDMultiOracle } from '../../../typechain/ChainlinkUSDMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ChainlinkUSDMultiOracle
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

  let chainlinkUSDOracle: ChainlinkUSDMultiOracle
  if (protocol.get('chainlinkUSDOracle') === undefined) {
      chainlinkUSDOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as ChainlinkUSDMultiOracle
      console.log(`ChainlinkUSDMultiOracle deployed at ${chainlinkUSDOracle.address}`)
      verify(chainlinkUSDOracle.address, [])
      protocol.set('chainlinkUSDOracle', chainlinkUSDOracle.address)
      writeAddressMap("protocol.json", protocol);
  } else {
      chainlinkUSDOracle = (await ethers.getContractAt('ChainlinkUSDMultiOracle', protocol.get('chainlinkUSDOracle') as string, ownerAcc)) as unknown as ChainlinkUSDMultiOracle
      console.log(`Reusing ChainlinkUSDMultiOracle at ${chainlinkUSDOracle.address}`)
  }
  if (!(await chainlinkUSDOracle.hasRole(ROOT, timelock.address))) {
      await chainlinkUSDOracle.grantRole(ROOT, timelock.address); console.log(`chainlinkUSDOracle.grantRoles(ROOT, timelock)`)
      while (!(await chainlinkUSDOracle.hasRole(ROOT, timelock.address))) { }
  }
})()
