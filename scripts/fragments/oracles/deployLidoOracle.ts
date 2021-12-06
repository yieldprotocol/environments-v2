import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate, bytesToBytes32 } from '../../../shared/helpers'
import { WSTETH, STETH } from '../../../shared/constants'
import { ROOT } from '../../../shared/constants'
import LidoOracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/lido/LidoOracle.sol/LidoOracle.json'

import { LidoOracle } from '../../../typechain/LidoOracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the LidoOracle
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
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
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

  let lidoOracle: LidoOracle
  if (protocol.get('lidoOracle') === undefined) {
      lidoOracle = (await deployContract(ownerAcc, LidoOracleArtifact, [bytesToBytes32(WSTETH), bytesToBytes32(STETH)])) as LidoOracle
      console.log(`LidoOracle deployed at ${lidoOracle.address}`)
      verify(lidoOracle.address, [bytesToBytes32(WSTETH), bytesToBytes32(STETH)])
      protocol.set('lidoOracle', lidoOracle.address)
      writeAddressMap("protocol.json", protocol);
  } else {
      lidoOracle = (await ethers.getContractAt('LidoOracle', protocol.get('lidoOracle') as string, ownerAcc)) as unknown as LidoOracle
      console.log(`Reusing LidoOracle at ${lidoOracle.address}`)
  }
  if (!(await lidoOracle.hasRole(ROOT, timelock.address))) {
      await lidoOracle.grantRole(ROOT, timelock.address); console.log(`lidoOracle.grantRoles(ROOT, timelock)`)
      while (!(await lidoOracle.hasRole(ROOT, timelock.address))) { }
  }
})()