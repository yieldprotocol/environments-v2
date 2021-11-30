import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { addTokenProposal } from '../../ladle/addTokenProposal'
import { addIntegrationProposal } from '../../ladle/addIntegrationProposal'
import { updateCompositePathsProposal } from '../../fragments/oracles/updateCompositePathsProposal'
import { Ladle, CompositeMultiOracle, Timelock } from '../../../typechain'
import { ETH, DAI, USDC, STETH, WSTETH, WAD } from '../../../shared/constants'

/**
 * @dev This script:
 *   1. Adds wstETH and stETH as tokens to Ladle, to allow `transfer` and `permit`
 *   2. Adds lidoWrapHandler as an integration to Ladle, to allow `route`
 *   3. Adds a STETH/ETH/DAI and STETH/ETH/USDC paths to the CompositeOracle, to be used by the frontend
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)

  // Input data: assetId, assetId, [intermediate assetId]
  const compositePaths: Array<[string, string, Array<string>]> = [
    [STETH, DAI,  [ETH]],
    [STETH, USDC, [ETH]],
  ]

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync(path + 'assets.json', 'utf8')) as Map<string, string>

  const wstEthAddress: string = assets.get(WSTETH) as string
  const stEthAddress: string = assets.get(STETH) as string
  const lidoWrapHandler: string = protocol.get('lidoWrapHandler') as string

  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addTokenProposal(ladle, wstEthAddress))
  proposal = proposal.concat(await addTokenProposal(ladle, stEthAddress))
  proposal = proposal.concat(await addIntegrationProposal(ladle, lidoWrapHandler))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
