import { ethers, waffle } from 'hardhat'
import CompoundMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CompoundMultiOracle.sol/CompoundMultiOracle.json'
import { ROOT } from '../../../shared/constants'
import { verify, writeAddressMap } from '../../../shared/helpers'
import { CompoundMultiOracle, Timelock } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the CompoundMultiOracles
 */
export const deployCompoundOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<CompoundMultiOracle> => {
  let compoundOracle: CompoundMultiOracle
  if (protocol.get('compoundOracle') === undefined) {
    compoundOracle = (await deployContract(ownerAcc, CompoundMultiOracleArtifact, [])) as CompoundMultiOracle
    console.log(`CompoundMultiOracle deployed at ${compoundOracle.address}`)
    verify(compoundOracle.address, [])
    protocol.set('compoundOracle', compoundOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    compoundOracle = await ethers.getContractAt(
      'CompoundMultiOracle',
      protocol.get('compoundOracle') as string,
      ownerAcc
    )
    console.log(`Reusing CompoundMultiOracle at ${compoundOracle.address}`)
  }
  if (!(await compoundOracle.hasRole(ROOT, timelock.address))) {
    await compoundOracle.grantRole(ROOT, timelock.address)
    console.log(`compoundOracle.grantRoles(ROOT, timelock)`)
    while (!(await compoundOracle.hasRole(ROOT, timelock.address))) {}
  }

  return compoundOracle
}
