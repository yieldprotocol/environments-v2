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

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let yearnOracle: YearnVaultMultiOracle
  if (protocol.get('yearnOracle') === undefined) {
      yearnOracle = (await deployContract(ownerAcc, YearnVaultMultiOracleArtifact)) as YearnVaultMultiOracle
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
})()