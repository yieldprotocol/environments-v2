import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { WAD } from '../../../../shared/constants'
import { mapToJson, jsonToMap, verify, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import UniswapV3OracleArtifact from '../../../../artifacts/@yield-protocol/vault-v2/contracts/oracles/uniswap/UniswapV3Oracle.sol/UniswapV3Oracle.json'

import { UniswapV3Oracle } from '../../../../typechain/UniswapV3Oracle'
import { Timelock } from '../../../../typechain/Timelock'

const { deployContract } = waffle

/**
 * @dev This script deploys the UniswapV3Oracle
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock gets ROOT access.
 */

;(async () => {
  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const ROOT = await timelock.ROOT()

  let uniswapOracle: UniswapV3Oracle
  if (protocol.get('uniswapOracle') === undefined) {
      uniswapOracle = (await deployContract(ownerAcc, UniswapV3OracleArtifact)) as UniswapV3Oracle
      console.log(`[UniswapOracle, '${uniswapOracle.address}'],`)
      verify(uniswapOracle.address, [])
      protocol.set('uniswapOracle', uniswapOracle.address)
      fs.writeFileSync(path + 'protocol.json', mapToJson(protocol), 'utf8')
  } else {
      uniswapOracle = (await ethers.getContractAt('UniswapV3Oracle', protocol.get('uniswapOracle') as string, ownerAcc)) as unknown as UniswapV3Oracle
  }
  if (!(await uniswapOracle.hasRole(ROOT, timelock.address))) {
      await uniswapOracle.grantRole(ROOT, timelock.address); console.log(`uniswapOracle.grantRoles(ROOT, timelock)`)
      while (!(await uniswapOracle.hasRole(ROOT, timelock.address))) { }
  }
})()