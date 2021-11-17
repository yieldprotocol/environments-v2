import { ethers } from 'hardhat'
import * as fs from 'fs'
import { WAD } from '../../../../shared/constants'
import { jsonToMap, proposeApproveExecute, getOriginalChainId, impersonate } from '../../../../shared/helpers'
import { orchestrateUniswapOracleProposal } from '../../oracles/uniswap/orchestrateUniswapOracleProposal'
import { UniswapV3Oracle, EmergencyBrake, Timelock } from '../../../../typechain'

/**
 * @dev This script orchestrates the UniswapOracle
 *
 * It takes as inputs the governance and protocol json address files.
 * Expectes the Timelock to have ROOT permissions on the UniswapOracle.
 * The Cloak gets ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

;(async () => {
  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  let ownerAcc = await impersonate(developer.get(chainId) as string, WAD)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const uniswapOracle = (await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol.get('uniswapOracle') as string,
    ownerAcc
  )) as unknown as UniswapV3Oracle

  const proposal = await orchestrateUniswapOracleProposal(ownerAcc, uniswapOracle, timelock, cloak)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
