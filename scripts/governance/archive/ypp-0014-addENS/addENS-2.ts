import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { orchestrateUniswapOracleProposal } from '../../fragments/oracles/orchestrateUniswapOracleProposal'
import { updateUniswapSourcesProposal } from '../../fragments/oracles/updateUniswapSourcesProposal'
import { updateSpotSourcesProposal } from '../../fragments/oracles/updateSpotSourcesProposal'
import { updateCompositeSourcesProposal } from '../../fragments/oracles/updateCompositeSourcesProposal'
import { updateCompositePathsProposal } from '../../fragments/oracles/updateCompositePathsProposal'

import { CompositeMultiOracle, ChainlinkMultiOracle, UniswapV3Oracle, Timelock, EmergencyBrake } from '../../../typechain'

import { ETH, DAI, USDC, ENS, WAD } from '../../../shared/constants'

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
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const UNISWAP = 'uniswapOracle'
  const CHAINLINK = 'chainlinkOracle'

  const ensEthPoolAddress: string = '0x92560c178ce069cc014138ed3c2f5221ba71f58a' // https://info.uniswap.org/#/tokens/0xc18360217d8f7ab5e7c516566761ea12ce7f9d72
  const kovanEnsEthSource = '0x19d7cCdB7B4caE085d3Fda330A01D139d7243Be4' // From spotSources.json in addresses archive
  const kovanEnsAddress = '0xA24b97c7617cc40dCc122F6dF813584A604a6C28' // From assets.json in addresses archive
  const kovanWethAddress = '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492' // From assets.json in addresses archive

  // Input data: baseId, quoteId, oracle name, pool address and twapInterval. baseId must match token0 and quoteId must match token1.
  const uniswapSources: Array<[string, string, string, string, number]> = [[ETH, ENS, UNISWAP, ensEthPoolAddress, 600]]

  // Input data: baseId, base address, quoteId, quote address, oracle name, source address
  const chainlinkSources: Array<[string, string, string, string, string, string]> = [
    [ENS, kovanEnsAddress as string, ETH, kovanWethAddress as string, CHAINLINK, kovanEnsEthSource],
  ]
  // Input data: baseId, quoteId, oracle name
  const compositeSources: Map<number, Array<[string, string, string]>> = new Map([
    [1, [[ENS, ETH, UNISWAP]]],
    [42, [[ENS, ETH, CHAINLINK]]],
  ])
  // Input data: assetId, assetId, [intermediate assetId]
  const compositePaths: Array<[string, string, Array<string>]> = [
    [ENS, DAI, [ETH]],
    [ENS, USDC, [ETH]],
  ]

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

  const compositeOracle = ((await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown) as CompositeMultiOracle
  const chainlinkOracle = ((await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )) as unknown) as ChainlinkMultiOracle
  const uniswapOracle = ((await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol.get('uniswapOracle') as string,
    ownerAcc
  )) as unknown) as UniswapV3Oracle
  const cloak = ((await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown) as EmergencyBrake
  const timelock = ((await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown) as Timelock

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateUniswapOracleProposal(ownerAcc, uniswapOracle, timelock, cloak))
  proposal =
    chainId === 1
      ? proposal.concat(await updateUniswapSourcesProposal(ownerAcc, protocol, uniswapSources))
      : proposal.concat(await updateSpotSourcesProposal(chainlinkOracle, chainlinkSources))
  proposal = proposal.concat(
    await updateCompositeSourcesProposal(
      ownerAcc,
      protocol,
      compositeOracle,
      compositeSources.get(chainId) as Array<[string, string, string]>
    )
  )
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
