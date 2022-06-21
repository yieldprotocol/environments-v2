import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
  bytesToBytes32,
} from '../../../shared/helpers'
import { ROOT, EULER } from '../../../shared/constants'
import ETokenMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/euler/ETokenMultiOracle.sol/ETokenMultiOracle.json'
import { ETokenMultiOracle, Timelock } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the ETokenMultiOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */
export const deployEulerOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<ETokenMultiOracle> => {
  let eulerOracle: ETokenMultiOracle
  if (protocol.get(EULER) === undefined) {
    eulerOracle = (await deployContract(ownerAcc, ETokenMultiOracleArtifact, [])) as ETokenMultiOracle
    console.log(`ETokenMultiOracle deployed at ${eulerOracle.address}`)
    verify(eulerOracle.address, [])
  } else {
    eulerOracle = (await ethers.getContractAt(
      'ETokenMultiOracle',
      protocol.get(EULER) as string,
      ownerAcc
    )) as unknown as ETokenMultiOracle
    console.log(`Reusing ETokenMultiOracle at ${eulerOracle.address}`)
  }
  if (!(await eulerOracle.hasRole(ROOT, timelock.address))) {
    await eulerOracle.grantRole(ROOT, timelock.address)
    console.log(`eulerOracle.grantRoles(ROOT, timelock)`)
    while (!(await eulerOracle.hasRole(ROOT, timelock.address))) {}
  }

  return eulerOracle
}
