import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate, bytesToBytes32 } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import YearnVaultMultiOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/yearn/YearnVaultMultiOracle.sol/YearnVaultMultiOracle.json'

import { YearnVaultMultiOracle } from '../../../typechain/YearnVaultMultiOracle'
import { Timelock } from '../../../typechain/Timelock'

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
  protocol: Map<string, string>,
): Promise<YearnVaultMultiOracle> => {
  let yearnOracle: YearnVaultMultiOracle
  if (protocol.get('yearnOracle') === undefined) {
      yearnOracle = (await deployContract(ownerAcc, YearnVaultMultiOracleArtifact, [])) as YearnVaultMultiOracle
      console.log(`YearnVaultMultiOracle deployed at ${yearnOracle.address}`)
      verify(yearnOracle.address, [])
      protocol.set('yearnOracle', yearnOracle.address)
      writeAddressMap("protocol.json", protocol);
  } else {
      yearnOracle = (await ethers.getContractAt('YearnVaultMultiOracle', protocol.get('yearnOracle') as string, ownerAcc)) as unknown as YearnVaultMultiOracle
      console.log(`Reusing YearnVaultMultiOracle at ${yearnOracle.address}`)
  }
  if (!(await yearnOracle.hasRole(ROOT, timelock.address))) {
      await yearnOracle.grantRole(ROOT, timelock.address); console.log(`yearnOracle.grantRoles(ROOT, timelock)`)
      while (!(await yearnOracle.hasRole(ROOT, timelock.address))) { }
  }

  return yearnOracle
}
