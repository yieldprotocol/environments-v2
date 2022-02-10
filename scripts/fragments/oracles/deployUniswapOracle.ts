import { ethers, waffle } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  writeAddressMap,
  verify,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'
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
export const deployUniswapOracle = async (
  ownerAcc: any,
  timelock: Timelock,
  protocol: Map<string, string>
): Promise<UniswapV3Oracle> => {
  let uniswapOracle: UniswapV3Oracle
  if (protocol.get('uniswapOracle') === undefined) {
    uniswapOracle = (await deployContract(ownerAcc, UniswapV3OracleArtifact, [])) as UniswapV3Oracle
    console.log(`UniswapV3Oracle deployed at ${uniswapOracle.address}`)
    verify(uniswapOracle.address, [])
    protocol.set('uniswapOracle', uniswapOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    uniswapOracle = (await ethers.getContractAt(
      'UniswapV3Oracle',
      protocol.get('uniswapOracle') as string,
      ownerAcc
    )) as unknown as UniswapV3Oracle
    console.log(`Reusing UniswapV3Oracle at ${uniswapOracle.address}`)
  }
  if (!(await uniswapOracle.hasRole(ROOT, timelock.address))) {
    await uniswapOracle.grantRole(ROOT, timelock.address)
    console.log(`uniswapOracle.grantRoles(ROOT, timelock)`)
    while (!(await uniswapOracle.hasRole(ROOT, timelock.address))) {}
  }

  return uniswapOracle
}
