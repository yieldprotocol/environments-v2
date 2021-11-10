import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, stringToBytes6, proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { updateSpotSourcesProposal } from '../../oracles/updateSpotSourcesProposal'
import { orchestrateAddedAssetProposal } from '../../orchestrateAddedAssetProposal'
import { makeIlkProposal } from '../../makeIlkProposal'
import { addIlksToSeriesProposal } from '../../addIlksToSeriesProposal'

import { Cauldron, Ladle, Witch, Wand, Timelock, EmergencyBrake } from '../../../../typechain'

import { ETH, DAI, USDC, LINK } from '../../../../shared/constants'

/**
 * @dev This script configures the Yield Protocol to use LINK as a collateral.
 * Previously, LINK should have been added as an asset with the Wand.
 * Add LINK as an asset
 * --- You are here ---
 * Add the LINK/ETH source to the Chainlink Oracle
 * Permission the LINKJoin
 * Make LINK into an Ilk
 * Approve LINK as collateral for all series
 */

;(async () => {
  const CHAINLINK = 'chainlinkOracle'
  let chainId: number
  
  const linkAddress = new Map([
    [1, '0x514910771af9ca656af840dff83e8264ecf986ca'],
    [42, '0xe37c6209C44d89c452A422DDF3B71D1538D58b96'],
  ]) // https://docs.chain.link/docs/link-token-contracts/

  // Because in forks the network name gets replaced by 'localhost' and chainId by 31337, we rely on checking known contracts to find out which chain are we on.
  if ((await ethers.provider.getCode(linkAddress.get(1) as string)) !== '0x') chainId = 1
  else if ((await ethers.provider.getCode(linkAddress.get(42) as string)) !== '0x') chainId = 42
  else throw "Unrecognized chain"

  const linkOracleAddress = new Map([
    [1, '0xDC530D9457755926550b59e8ECcdaE7624181557'],
    [42, '0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38']
  ]) // https://docs.chain.link/docs/ethereum-addresses/

  const wethAddress = new Map([
    [1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    [42, '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492']
  ]) // From assets.json in addresses archive

  // Input data: baseId, base address, quoteId, quote address, oracle name, source address
  const linkEthSource : Array<[string, string, string, string, string, string]> = [
        [LINK, linkAddress.get(chainId) as string, ETH, wethAddress.get(chainId) as string, CHAINLINK,  linkOracleAddress.get(chainId) as string],
      ]
  // Input data: assetId, asset address
  const assets: Array<[string, string]> = [
    [LINK, linkAddress.get(chainId) as string],
  ]
  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
  const ilks: Array<[string, string, string, number, number, number, number, number]> = [
    [DAI, LINK, CHAINLINK, 2000000, 500000, 250000, 100, 18],
    [USDC, LINK, CHAINLINK, 2000000, 500000, 250000, 100, 6],
  ]
  // Input data: seriesId, [ilkId]
  const seriesIlks: Array<[string, string[]]> = [
    [stringToBytes6('0104'), [LINK]],
    [stringToBytes6('0105'), [LINK]],
    [stringToBytes6('0204'), [LINK]],
    [stringToBytes6('0205'), [LINK]],
  ]

  const developerIfImpersonating = new Map([
    [1,'0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42,'0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5']
  ])

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

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
  proposal = proposal.concat(await updateSpotSourcesProposal(ownerAcc, linkEthSource))
  proposal = proposal.concat(await orchestrateAddedAssetProposal(ownerAcc, ladle, timelock, cloak, assets))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, witch, wand, cloak, ilks))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
