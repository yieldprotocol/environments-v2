import { ethers, waffle } from 'hardhat'
import YearnVaultMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/yearn/YearnVaultMultiOracle.sol/YearnVaultMultiOracle.json'
import { ROOT } from '../../../shared/constants'
import { verify, writeAddressMap } from '../../../shared/helpers'
import { Timelock, YearnVaultMultiOracle } from '../../../typechain'

const { deployContract } = waffle

/**
 * @dev This script deploys the YearnVaultMultiOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */
export const deployYearnOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<YearnVaultMultiOracle> => {
  let yearnOracle: YearnVaultMultiOracle
  if (protocol.get('yearnOracle') === undefined) {
    yearnOracle = (await deployContract(ownerAcc, YearnVaultMultiOracleArtifact, [])) as YearnVaultMultiOracle
    console.log(`YearnVaultMultiOracle deployed at ${yearnOracle.address}`)
    verify(yearnOracle.address, [])
    protocol.set('yearnOracle', yearnOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    yearnOracle = await ethers.getContractAt('YearnVaultMultiOracle', protocol.get('yearnOracle') as string, ownerAcc)
    console.log(`Reusing YearnVaultMultiOracle at ${yearnOracle.address}`)
  }
  if (!(await yearnOracle.hasRole(ROOT, timelock.address))) {
    await yearnOracle.grantRole(ROOT, timelock.address)
    console.log(`yearnOracle.grantRoles(ROOT, timelock)`)
    while (!(await yearnOracle.hasRole(ROOT, timelock.address))) {}
  }

  return yearnOracle
}
