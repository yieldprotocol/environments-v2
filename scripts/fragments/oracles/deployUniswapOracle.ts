import { ethers, waffle } from 'hardhat'
import { getOriginalChainId, readAddressMappingIfExists, writeAddressMap, verify, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ROOT } from '../../../shared/constants'
import UniswapV3OracleArtifact from '../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/uniswap/UniswapV3Oracle.sol/UniswapV3Oracle.json'

import { UniswapV3Oracle } from '../../../typechain/UniswapV3Oracle'
import { Timelock } from '../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the UniswapV3Oracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
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

  let uniswapOracle: UniswapV3Oracle
  if (protocol.get('uniswapOracle') === undefined) {
      uniswapOracle = (await deployContract(ownerAcc, UniswapV3OracleArtifact)) as UniswapV3Oracle
      console.log(`UniswapOracle deployed at ${uniswapOracle.address}`)
      verify(uniswapOracle.address, [])
      protocol.set('uniswapOracle', uniswapOracle.address)
      writeAddressMap("protocol.json", protocol);
  } else {
      uniswapOracle = (await ethers.getContractAt('UniswapV3Oracle', protocol.get('uniswapOracle') as string, ownerAcc)) as unknown as UniswapV3Oracle
      console.log(`Reusing UniswapOracle at ${uniswapOracle.address}`)
  }
  if (!(await uniswapOracle.hasRole(ROOT, timelock.address))) {
      await uniswapOracle.grantRole(ROOT, timelock.address); console.log(`uniswapOracle.grantRoles(ROOT, timelock)`)
      while (!(await uniswapOracle.hasRole(ROOT, timelock.address))) { }
  }
})()