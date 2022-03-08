import { ethers, waffle } from 'hardhat'
import { writeAddressMap, verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import ChainlinkL2USDMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkL2USDMultiOracle.sol/ChainlinkL2USDMultiOracle.json'

import { ChainlinkL2USDMultiOracle } from '../../../typechain/ChainlinkL2USDMultiOracle'
import { Timelock } from '../../../typechain/Timelock'
import { CHAINLINKUSD } from '../../../shared/constants'

const { deployContract } = waffle

/**
 * @dev This script deploys the ChainlinkL2USDMultiOracle
 */
export const deployChainlinkL2USDOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>,
  sequencerFlags: string
): Promise<ChainlinkL2USDMultiOracle> => {
  let chainlinkL2USDOracle: ChainlinkL2USDMultiOracle
  if (protocol.get(CHAINLINKUSD) === undefined) {
    chainlinkL2USDOracle = (await deployContract(
      ownerAcc,
      ChainlinkL2USDMultiOracleArtifact,
      [sequencerFlags]
    )) as ChainlinkL2USDMultiOracle
    console.log(`ChainlinkL2USDMultiOracle deployed at ${chainlinkL2USDOracle.address}`)
    verify(chainlinkL2USDOracle.address, [sequencerFlags])
    protocol.set(CHAINLINKUSD, chainlinkL2USDOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    chainlinkL2USDOracle = (await ethers.getContractAt(
      'ChainlinkL2USDMultiOracle',
      protocol.get(CHAINLINKUSD) as string,
      ownerAcc
    )) as unknown as ChainlinkL2USDMultiOracle
    console.log(`Reusing ChainlinkL2USDMultiOracle at ${chainlinkL2USDOracle.address}`)
  }
  if (!(await chainlinkL2USDOracle.hasRole(ROOT, timelock.address))) {
    await chainlinkL2USDOracle.grantRole(ROOT, timelock.address)
    console.log(`chainlinkL2USDOracle.grantRoles(ROOT, timelock)`)
    while (!(await chainlinkL2USDOracle.hasRole(ROOT, timelock.address))) {}
  }

  return chainlinkL2USDOracle
}
