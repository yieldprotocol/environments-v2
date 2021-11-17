import { ethers } from 'hardhat'
import * as fs from 'fs'
import { stringToBytes6, jsonToMap, getOwnerOrImpersonate, getOriginalChainId, proposeApproveExecute } from '../../../../shared/helpers'

import { updateChiSourceProposal } from '../../oracles/updateChiSourceProposal'
import { updateRateSourceProposal } from '../../oracles/updateRateSourceProposal'
import { makeBaseProposal } from '../../makeBaseProposal'
import { makeIlkProposal } from '../../makeIlkProposal'
import { addSeriesProposal } from '../../assetsAndSeries/addSeriesProposal'
import { IOracle, CompoundMultiOracle, Ladle, Witch, Wand, EmergencyBrake, Timelock } from '../../../../typechain'
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

  const CHAINLINK = 'chainlinkOracle'
  const COMPOUND = 'compoundOracle'
  const COMPOSITE = 'compositeOracle'

  const newChiSources = new Map([
    [1, [[ETH,  '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5']]],
    [42, [[ETH,  '0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72']]],
  ])

  const newRateSources = new Map([
    [1, [[ETH,  '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5']]],
    [42, [[ETH,  '0x41b5844f4680a8c38fbb695b7f9cfd1f64474a72']]],
  ])

  const newBases: Array<[string, string]> = [
    [ETH, COMPOUND],
  ]

  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
  const newChainlinkIlks: Array<[string, string, string, number, number, number, number, number]> = [
    [ETH, ETH, CHAINLINK, 1000000, 1000000, 10000000, 0, 18], // Constant 1, no dust
    [ETH, DAI, CHAINLINK, 1500000, 666000, 500000, 100, 18],
    [ETH, USDC, CHAINLINK, 1500000, 666000, 1000000, 100, 18],
    [ETH, WBTC, CHAINLINK, 1500000, 666000, 500000, 100, 18],
  ]

  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
  const newCompositeIlks: Array<[string, string, string, number, number, number, number, number]> = [
    [ETH, WSTETH, COMPOSITE, 1500000, 666000, 100000, 1, 6], // Via ETH
  ]

  const newSeries: Array<[string, string, number, string[], string, string]> = [
    // name, baseId, maturity, ilkIds, name, symbol
    [stringToBytes6('0005'), ETH, EOMAR22, [ETH, DAI, USDC, WBTC, WSTETH], 'FYETH2203', 'FYETH2203'], // Mar22
    [stringToBytes6('0006'), ETH, EOJUN22, [ETH, DAI, USDC, WBTC, WSTETH], 'FYETH2206', 'FYETH2206'], // Jun22
  ]

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const lendingOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(COMPOUND) as string,
    ownerAcc
  )) as unknown as IOracle
  const spotOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(CHAINLINK) as string,
    ownerAcc
  )) as unknown as IOracle
  const compositeOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown as IOracle
  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch
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
  proposal = proposal.concat(await updateChiSourceProposal(ownerAcc, lendingOracle as unknown as CompoundMultiOracle, newChiSources.get(chainId) as [string, string][]))
  proposal = proposal.concat(await updateRateSourceProposal(ownerAcc, lendingOracle as unknown as CompoundMultiOracle, newRateSources.get(chainId) as [string, string][]))
  proposal = proposal.concat(await makeBaseProposal(ownerAcc, lendingOracle, ladle, wand, witch, cloak, newBases))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, spotOracle, ladle, witch, wand, cloak, newChainlinkIlks))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, compositeOracle, ladle, witch, wand, cloak, newCompositeIlks))
  proposal = proposal.concat(await addSeriesProposal(wand, newSeries))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
