import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, impersonate, getOriginalChainId } from '../../../../shared/helpers'

import { orchestrateUniswapOracleProposal } from '../../oracles/uniswap/orchestrateUniswapOracleProposal'
import { updateUniswapSourcesProposal } from '../../oracles/uniswap/updateUniswapSourcesProposal'
import { updateCompositePairsProposal } from '../../oracles/updateCompositePairsProposal'
import { updateCompositePathsProposal } from '../../oracles/updateCompositePathsProposal'

import { CompositeMultiOracle, UniswapV3Oracle, Timelock, EmergencyBrake } from '../../../../typechain'

import { ETH, DAI, USDC, ENS, WAD } from '../../../../shared/constants'

/**
 * @dev This script configures the ENS price feed
 * Previously, the UniswapOracle should have been deployed, and ROOT access
 * given to the Timelock. ENS should also have been added as an asset to the Protocol.
 * Deploy the Uniswap oracle
 * --- You are here ---
 * Configure the permissions for the Uniswap Oracle
 * Add the 0.3% ENS/ETH pool as the ENS/ETH source in the Uniswap Oracle
 * Add the UniswapOracle as the ENS/ETH source in the Composite Oracle
 * Add the DAI/ETH/ENS and USDC/ETH/ENS paths in the Composite Oracle
 */

;(async () => {
  const chainId = await getOriginalChainId()
  // if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  if (chainId !== 1) throw "Only Mainnet supported (for now)"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const UNISWAP = 'uniswapOracle'

  const ensEthPoolAddress: string = '0x92560c178ce069cc014138ed3c2f5221ba71f58a' // https://info.uniswap.org/#/tokens/0xc18360217d8f7ab5e7c516566761ea12ce7f9d72
  
  // Input data: baseId, quoteId, oracle name, source address
  const uniswapSources: Array<[string, string, string, string]> = [
    [ENS, ETH, UNISWAP, ensEthPoolAddress],
  ]
  // Input data: baseId, quoteId, oracle name
  const compositeSources: Array<[string, string, string]> = [
    [ENS, ETH, UNISWAP],
  ]
  // Input data: assetId, assetId, [intermediate assetId]
  const compositePaths: Array<[string, string, Array<string>]> = [
    [ENS, DAI, [ETH]],
    [ENS, USDC, [ETH]],
  ]

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await impersonate(developer.get(chainId) as string, WAD)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const uniswapOracle = (await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol.get('uniswapOracle') as string,
    ownerAcc
  )) as unknown as UniswapV3Oracle
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

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateUniswapOracleProposal(ownerAcc, uniswapOracle, timelock, cloak))
  proposal = proposal.concat(await updateUniswapSourcesProposal(ownerAcc, protocol, uniswapSources))
  proposal = proposal.concat(await updateCompositePairsProposal(ownerAcc, protocol, compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
