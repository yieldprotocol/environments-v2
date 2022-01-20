import { ethers, waffle } from 'hardhat'
import { writeAddressMap, verify } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import AccumulatorMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/accumulator/AccumulatorMultiOracle.sol/AccumulatorMultiOracle.json'

import { AccumulatorMultiOracle } from '../../../typechain/AccumulatorMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle;

/**
 * @dev This script deploys the AccumulatorMultiOracle
 */
export const deployAccumulatorOracle = async (
    ownerAcc: any,
    timelock: Timelock,
    protocol: Map<string, string>,
  ): Promise<AccumulatorMultiOracle> => {
    let accumulatorOracle: AccumulatorMultiOracle
    if (protocol.get('accumulatorOracle') === undefined) {
        accumulatorOracle = (await deployContract(ownerAcc, AccumulatorMultiOracleArtifact, [])) as AccumulatorMultiOracle
        console.log(`AccumulatorMultiOracle deployed at ${accumulatorOracle.address}`)
        verify(accumulatorOracle.address, [])
    } else {
        accumulatorOracle = (await ethers.getContractAt('AccumulatorMultiOracle', protocol.get('accumulatorOracle') as string, ownerAcc)) as unknown as AccumulatorMultiOracle
        console.log(`Reusing AccumulatorMultiOracle at ${accumulatorOracle.address}`)
    }
    if (!(await accumulatorOracle.hasRole(ROOT, timelock.address))) {
        await accumulatorOracle.grantRole(ROOT, timelock.address); console.log(`accumulatorOracle.grantRoles(ROOT, timelock)`)
        while (!(await accumulatorOracle.hasRole(ROOT, timelock.address))) { }
    }

  return accumulatorOracle
}
