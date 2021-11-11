import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, stringToBytes6, proposeApproveExecute, impersonate, getOriginalChainId } from '../../../../shared/helpers'

import { orchestrateAddedAssetProposal } from '../../orchestrateAddedAssetProposal'
import { makeIlkProposal } from '../../makeIlkProposal'
import { addIlksToSeriesProposal } from '../../addIlksToSeriesProposal'

import { Cauldron, Ladle, Witch, Wand, Timelock, EmergencyBrake } from '../../../../typechain'

import { DAI, USDC, ENS, WAD } from '../../../../shared/constants'

/**
 * @dev This script adds ENS as an ilk to the Yield Protocol
 * Previously, the UniswapOracle should have been deployed, and ROOT access
 * given to the Timelock. ENS should also have been added as an asset to the Protocol.
 * Deploy the Uniswap oracle
 * Add ENS as an asset
 * Configure the permissions for the Uniswap Oracle
 * Add the 0.3% ENS/ETH pool as the ENS/ETH source in the Uniswap Oracle
 * Add the UniswapOracle as the ENS/ETH source in the Composite Oracle
 * Add the DAI/ETH/ENS and USDC/ETH/ENS paths in the Composite Oracle
 * --- You are here ---
 * Permission the ENSJoin
 * Make ENS into an Ilk
 * Approve ENS as collateral for all series
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const COMPOSITE = 'compositeOracle'

  const ensAddress = new Map([
    [1, '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
    [42, '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  ]) // https://ens.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU
  
  // Input data: assetId, asset address
  const assets: Array<[string, string]> = [
    [ENS, ensAddress.get(chainId) as string],
  ]
  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
  const ilks: Array<[string, string, string, number, number, number, number, number]> = [
    [DAI, ENS, COMPOSITE, 1670000, 600000, 500000, 100, 18],
    [USDC, ENS, COMPOSITE, 1670000, 600000, 500000, 100, 6],
  ]
  // Input data: seriesId, [ilkId]
  const seriesIlks: Array<[string, string[]]> = [
    [stringToBytes6('0104'), [ENS]],
    [stringToBytes6('0105'), [ENS]],
    [stringToBytes6('0204'), [ENS]],
    [stringToBytes6('0205'), [ENS]],
  ]

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await impersonate(developer.get(chainId) as string, WAD)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync(path + 'joins.json', 'utf8')) as Map<string, string>

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
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch
  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand
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
  proposal = proposal.concat(await orchestrateAddedAssetProposal(ownerAcc, joins, ladle, timelock, cloak, assets))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, protocol, joins, witch, wand, cloak, ilks))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
