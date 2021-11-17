import { ethers } from 'hardhat'
import * as fs from 'fs'
import { stringToBytes6, jsonToMap, getOwnerOrImpersonate, getOriginalChainId, proposeApproveExecute } from '../../../../shared/helpers'

import { orchestrateSeriesProposal } from '../../assetsAndSeries/orchestrateSeriesProposal'
import { initPoolsProposal } from '../../assetsAndSeries/initPoolsProposal'
import { orchestrateStrategiesProposal } from '../../../strategies/orchestrateStrategiesProposal'
import { initStrategiesProposal } from '../../../strategies/initStrategiesProposal'
import { Cauldron, Ladle, EmergencyBrake, Timelock } from '../../../../typechain'
import { ETH, DAI, USDC, WBTC, WSTETH, WAD } from '../../../../shared/constants'

/**
 * @dev This script deploys two strategies to be used for Ether
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)

  const EOMAR22 = 1648177200
  const EOJUN22 = 0

  const poolsInit: Array<[string]> = [
    // [seriesId]
    [stringToBytes6('0005')],
    [stringToBytes6('0006')],
  ]

  const newSeries: Array<[string, string, number, string[], string, string]> = [
    // name, baseId, maturity, ilkIds, name, symbol
    [stringToBytes6('0005'), ETH, EOMAR22, [ETH, DAI, USDC, WBTC, WSTETH], 'FYETH2203', 'FYETH2203'], // Mar22
    [stringToBytes6('0006'), ETH, EOJUN22, [ETH, DAI, USDC, WBTC, WSTETH], 'FYETH2206', 'FYETH2206'], // Jun22
  ]

  const strategiesData: Array<[string, string, string]> = [
    // name, symbol, baseId
    ['Yield Strategy ETH 6M Mar Sep',  'YSETH6MMS',  ETH],
    ['Yield Strategy ETH 6M Jun Dec',  'YSETH6MJD',  ETH],
  ]

  // Input data
  const strategiesInit: Array<[string, string]> = [
    // [strategyId, startPoolId]
    ['YSDAI6MMS', stringToBytes6('0005')],
    ['YSDAI6MJD', stringToBytes6('0006')],
  ]

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
  const strategies = jsonToMap(fs.readFileSync(path + 'strategies.json', 'utf8')) as Map<string, string>

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cloak = (await ethers.getContractAt(
    'Cloak',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateSeriesProposal(ownerAcc, cauldron, ladle, timelock, cloak, newSeries))
  proposal = proposal.concat(await initPoolsProposal(ownerAcc, ladle, poolsInit))
  proposal = proposal.concat(await orchestrateStrategiesProposal(ownerAcc, strategies, timelock, strategiesData))
  proposal = proposal.concat(await initStrategiesProposal(ownerAcc, strategies, ladle, strategiesInit))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
