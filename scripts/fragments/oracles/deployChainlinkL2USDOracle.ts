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
export const deployChainlinkL2USDOracle = async (
    ownerAcc: any,
    timelock: Timelock,
    protocol: Map<string, string>,
  ): Promise<ChainlinkUSDMultiOracle> => {
    let chainlinkL2USDOracle: ChainlinkUSDMultiOracle
    if (protocol.get('chainlinkL2USDOracle') === undefined) {
        chainlinkL2USDOracle = (await deployContract(ownerAcc, ChainlinkUSDMultiOracleArtifact, [])) as ChainlinkUSDMultiOracle
        console.log(`ChainlinkUSDMultiOracle deployed at ${chainlinkL2USDOracle.address}`)
        verify(chainlinkL2USDOracle.address, [])
        protocol.set('chainlinkL2USDOracle', chainlinkL2USDOracle.address)
        writeAddressMap("protocol.json", protocol);
    } else {
        chainlinkL2USDOracle = (await ethers.getContractAt('ChainlinkUSDMultiOracle', protocol.get('chainlinkL2USDOracle') as string, ownerAcc)) as unknown as ChainlinkUSDMultiOracle
        console.log(`Reusing ChainlinkUSDMultiOracle at ${chainlinkL2USDOracle.address}`)
    }
    if (!(await chainlinkL2USDOracle.hasRole(ROOT, timelock.address))) {
        await chainlinkL2USDOracle.grantRole(ROOT, timelock.address); console.log(`chainlinkL2USDOracle.grantRoles(ROOT, timelock)`)
        while (!(await chainlinkL2USDOracle.hasRole(ROOT, timelock.address))) { }
    }

  return chainlinkL2USDOracle
}
