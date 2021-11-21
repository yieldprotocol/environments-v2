import { ethers } from 'hardhat'
import * as fs from 'fs'
import {
  jsonToMap,
  stringToBytes6,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
  mapToJson,
} from '../../../../shared/helpers'

import { updateSpotSourcesProposal } from '../../oracles/updateSpotSourcesProposal'
import { orchestrateAddedAssetProposal } from '../../orchestrateAddedAssetProposal'
import { makeIlkProposal } from '../../makeIlkProposal'
import { addIlksToSeriesProposal } from '../../addIlksToSeriesProposal'

import { Cauldron, Ladle, Witch, Wand, Timelock, EmergencyBrake } from '../../../../typechain'

import { ETH, DAI, USDC, UNI } from '../../../../shared/constants'

/**
 * @dev This script configures the Yield Protocol to use UNI as a collateral.
 * Previously, UNI should have been added as an asset with the Wand.
 * Add UNI as an asset
 * --- You are here ---
 * Add the UNI/ETH source to the Chainlink Oracle
 * Permission the UNIJoin
 * Make UNI into an Ilk
 * Approve UNI as collateral for all series
 */
;(async () => {
  const CHAINLINK = 'chainlinkOracle'
  let chainId: number

  const uniAddress = new Map([
    [1, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
    [42, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  ]) // https://github.com/Uniswap/v3-periphery/blob/main/deploys.md

  chainId = await getOriginalChainId()

  if (chainId!=1) throw "Only Mainnet supported"

  const uniOracleAddress = new Map([
    [1, '0xD6aA3D25116d8dA79Ea0246c4826EB951872e02e'],
  ]) // https://docs.chain.link/docs/ethereum-addresses/

  const wethAddress = new Map([
    [1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    [42, '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'],
  ]) // From assets.json in addresses archive

  // Input data: baseId, base address, quoteId, quote address, oracle name, source address
  const uniEthSource: Array<[string, string, string, string, string, string]> = [
    [
      UNI,
      uniAddress.get(chainId) as string,
      ETH,
      wethAddress.get(chainId) as string,
      CHAINLINK,
      uniOracleAddress.get(chainId) as string,
    ],
  ]
  
  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
  const ilks: Array<[string, string, string, number, number, number, number, number]> = [
    [DAI, UNI, CHAINLINK, 2000000, 500000, 250000, 100, 18],
    [USDC, UNI, CHAINLINK, 2000000, 500000, 250000, 100, 6],
  ]
  // Input data: seriesId, [ilkId]
  const seriesIlks: Array<[string, string[]]> = [
    [stringToBytes6('0104'), [UNI]],
    [stringToBytes6('0105'), [UNI]],
    [stringToBytes6('0204'), [UNI]],
    [stringToBytes6('0205'), [UNI]],
  ]

  const developerIfImpersonating = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  const path = chainId == 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync(path+'joins.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync(path + 'assets.json', 'utf8')) as Map<string, string>
  
  const cauldron = ((await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown) as Cauldron
  const ladle = ((await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown) as Ladle
  const witch = ((await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown) as Witch
  const wand = ((await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown) as Wand
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

  
  // Input data: assetId, asset address
  const addedAssets: Array<[string, string]> = [
    [UNI, uniAddress.get(chainId) as string],
  ]

  // Update json database from previous step
  for (let [assetId, assetAddress] of addedAssets) {
    // Make sure the asset is recorded
    assets.set(assetId, assetAddress as string)
    fs.writeFileSync(path + 'assets.json', mapToJson(assets), 'utf8')
    // The joins file can only be updated after the successful execution of the proposal
    joins.set(assetId, (await ladle.joins(assetId)) as string)
    fs.writeFileSync(path + 'joins.json', mapToJson(joins), 'utf8')
  }

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateSpotSourcesProposal(ownerAcc,protocol, uniEthSource))
  proposal = proposal.concat(await orchestrateAddedAssetProposal(ownerAcc,joins, ladle, timelock, cloak, addedAssets))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc,protocol,joins, witch, wand, cloak, ilks))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
