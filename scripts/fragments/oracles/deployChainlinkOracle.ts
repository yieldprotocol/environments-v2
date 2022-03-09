import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import ChainlinkMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'

import { ChainlinkMultiOracle } from '../../../typechain/ChainlinkMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ChainlinkMultiOracle
 */
export const deployChainlinkOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<ChainlinkMultiOracle> => {
  let chainlinkOracle: ChainlinkMultiOracle
  if (protocol.get('chainlinkOracle') === undefined) {
    chainlinkOracle = (await deployContract(ownerAcc, ChainlinkMultiOracleArtifact, [])) as ChainlinkMultiOracle
    console.log(`ChainlinkMultiOracle deployed at ${chainlinkOracle.address}`)
    verify(chainlinkOracle.address, [])
    protocol.set('chainlinkOracle', chainlinkOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    chainlinkOracle = (await ethers.getContractAt(
      'ChainlinkMultiOracle',
      protocol.get('chainlinkOracle') as string,
      ownerAcc
    )) as unknown as ChainlinkMultiOracle
    console.log(`Reusing ChainlinkMultiOracle at ${chainlinkOracle.address}`)
  }
  if (!(await chainlinkOracle.hasRole(ROOT, timelock.address))) {
    await chainlinkOracle.grantRole(ROOT, timelock.address)
    console.log(`chainlinkOracle.grantRoles(ROOT, timelock)`)
    while (!(await chainlinkOracle.hasRole(ROOT, timelock.address))) {}
  }

  return chainlinkOracle
}
