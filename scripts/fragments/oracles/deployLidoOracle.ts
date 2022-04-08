import { ethers, waffle } from 'hardhat'
import LidoOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/lido/LidoOracle.sol/LidoOracle.json'
import { ROOT, STETH, WSTETH } from '../../../shared/constants'
import { bytesToBytes32, verify, writeAddressMap } from '../../../shared/helpers'
import { LidoOracle, Timelock } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the LidoOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */
export const deployLidoOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<LidoOracle> => {
  let lidoOracle: LidoOracle
  if (protocol.get('lidoOracle') === undefined) {
    lidoOracle = (await deployContract(ownerAcc, LidoOracleArtifact, [
      bytesToBytes32(WSTETH),
      bytesToBytes32(STETH),
    ])) as LidoOracle
    console.log(`LidoOracle deployed at ${lidoOracle.address}`)
    verify(lidoOracle.address, [bytesToBytes32(WSTETH), bytesToBytes32(STETH)])
    protocol.set('lidoOracle', lidoOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    lidoOracle = await ethers.getContractAt('LidoOracle', protocol.get('lidoOracle') as string, ownerAcc)
    console.log(`Reusing LidoOracle at ${lidoOracle.address}`)
  }
  if (!(await lidoOracle.hasRole(ROOT, timelock.address))) {
    await lidoOracle.grantRole(ROOT, timelock.address)
    console.log(`lidoOracle.grantRoles(ROOT, timelock)`)
    while (!(await lidoOracle.hasRole(ROOT, timelock.address))) {}
  }

  return lidoOracle
}
