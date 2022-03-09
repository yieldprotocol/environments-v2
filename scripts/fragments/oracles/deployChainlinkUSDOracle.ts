import { ethers, waffle } from 'hardhat'
import { writeAddressMap, verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import ChainlinkUSDMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkUSDMultiOracle.sol/ChainlinkUSDMultiOracle.json'

import { ChainlinkUSDMultiOracle } from '../../../typechain/ChainlinkUSDMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the ChainlinkUSDMultiOracle
 */
export const deployChainlinkUSDOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<ChainlinkUSDMultiOracle> => {
  let chainlinkUSDOracle: ChainlinkUSDMultiOracle
  if (protocol.get('chainlinkUSDOracle') === undefined) {
    chainlinkUSDOracle = (await deployContract(
      ownerAcc,
      ChainlinkUSDMultiOracleArtifact,
      []
    )) as ChainlinkUSDMultiOracle
    console.log(`ChainlinkUSDMultiOracle deployed at ${chainlinkUSDOracle.address}`)
    verify(chainlinkUSDOracle.address, [])
    protocol.set('chainlinkUSDOracle', chainlinkUSDOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    chainlinkUSDOracle = (await ethers.getContractAt(
      'ChainlinkUSDMultiOracle',
      protocol.get('chainlinkUSDOracle') as string,
      ownerAcc
    )) as unknown as ChainlinkUSDMultiOracle
    console.log(`Reusing ChainlinkUSDMultiOracle at ${chainlinkUSDOracle.address}`)
  }
  if (!(await chainlinkUSDOracle.hasRole(ROOT, timelock.address))) {
    await chainlinkUSDOracle.grantRole(ROOT, timelock.address)
    console.log(`chainlinkUSDOracle.grantRoles(ROOT, timelock)`)
    while (!(await chainlinkUSDOracle.hasRole(ROOT, timelock.address))) {}
  }

  return chainlinkUSDOracle
}
