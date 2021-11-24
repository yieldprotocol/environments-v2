import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, stringToBytes6, proposeApproveExecute, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { orchestrateLidoOracleProposal } from '../../../fragments/oracles/orchestrateLidoOracleProposal'
import { updateLidoSourceProposal } from '../../../fragments/oracles/updateLidoSourceProposal'
import { updateSpotSourcesProposal } from '../../../fragments/oracles/updateSpotSourcesProposal'
import { orchestrateCompositeOracleProposal } from '../../../fragments/oracles/orchestrateCompositeOracleProposal'
import { updateCompositePairsProposal } from '../../../fragments/oracles/updateCompositePairsProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'
import { orchestrateAddedAssetProposal } from '../../orchestrateAddedAssetProposal'
import { makeIlkProposal } from '../../makeIlkProposal'
import { addIlksToSeriesProposal } from '../../addIlksToSeriesProposal'

import { Cauldron, Ladle, Witch, Wand, CompositeMultiOracle, LidoOracle, Timelock, EmergencyBrake } from '../../../../typechain'

import { ETH, DAI, USDC, WBTC, WSTETH, STETH } from '../../../../shared/constants'

/**
 * @dev This script executes the part of ypp-0007 that can be condensed in a single Timelock proposal.
 * Previously, the CompositeMultiOracle and the LidoOracle should have been deployed, and ROOT access
 * given to the Timelock. WstETH should also have been added as an asset to the Cauldron.
 * Deploy the Composite Oracle
 * Deploy the Lido oracle
 * Add WstETH as an asset
 * --- You are here ---
 * Configure the permissions for the Lido Oracle
 * Add WstETH as the source for the Lido Oracle
 * Add the stETH/ETH source to the Chainlink Oracle
 * Configure the permissions for the Composite Oracle
 * Add the underlying sources for the Composite Oracle
 * Add the DAI/WSTETH and USDC/WSTETH paths in the Composite Oracle
 * Permission the WstETHJoin
 * Make WstETH into an Ilk
 * Approve WstEth as collateral for all series
 */

;(async () => {
  const CHAINLINK = 'chainlinkOracle'
  const LIDO = 'lidoOracle'
  const COMPOSITE = 'compositeOracle'

  const wstEthAddress: string = '0xB12C63eD91e901995E68023293AC1A308ffA6c3c' // https://docs.lido.fi/deployed-contracts
  const stEthAddress: string = '0x2296AB4F92f7fADC78eD02A9576B9a779CAa91bE' // https://docs.lido.fi/deployed-contracts
  const wethAddress: string = '0x55C0458edF1D8E07DF9FB44B8960AecC515B4492'
  // Input data: baseId, base address, quoteId, quote address, oracle name, source address
  const stEthEthSource: Array<[string, string, string, string, string, string]> = [
    [STETH, stEthAddress, ETH, wethAddress, CHAINLINK,  '0x545C84A9799dA0c906f3e22595b5d53c9275b9d9'], // https://docs.lido.fi/deployed-contracts
  ]
  // Input data: baseId, quoteId, oracle name
  const compositeSources: Array<[string, string, string]> = [
    [DAI,    ETH,   CHAINLINK],
    [USDC,   ETH,   CHAINLINK],
    [WBTC,   ETH,   CHAINLINK],
    [STETH,  ETH,   CHAINLINK],
    [WSTETH, STETH, LIDO],
  ]
  // Input data: assetId, assetId, [intermediate assetId]
  const compositePaths: Array<[string, string, Array<string>]> = [
    [WSTETH, DAI, [STETH, ETH]],
    [WSTETH, USDC, [STETH, ETH]],
  ]
  // Input data: assetId, asset address
  const assets: Array<[string, string]> = [
    [WSTETH, wstEthAddress],
  ]
  // Input data: baseId, ilkId, oracle name, ratio (1000000 == 100%), inv(ratio), line, dust, dec
  const ilks: Array<[string, string, string, number, number, number, number, number]> = [
    [DAI, WSTETH, COMPOSITE, 1400000, 714000, 500000, 1, 18],
    [USDC, WSTETH, COMPOSITE, 1400000, 714000, 500000, 1, 6],
  ]
  // Input data: seriesId, [ilkId]
  const seriesIlks: Array<[string, string[]]> = [
    [stringToBytes6('0104'), [WSTETH]],
    [stringToBytes6('0105'), [WSTETH]],
    [stringToBytes6('0204'), [WSTETH]],
    [stringToBytes6('0205'), [WSTETH]],
  ]

  const developerIfImpersonating = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

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
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const lidoOracle = (await ethers.getContractAt(
    'LidoOracle',
    protocol.get('lidoOracle') as string,
    ownerAcc
  )) as unknown as LidoOracle
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
  proposal = proposal.concat(await orchestrateLidoOracleProposal(ownerAcc, lidoOracle, timelock, cloak))
  proposal = proposal.concat(await updateLidoSourceProposal(ownerAcc, lidoOracle, wstEthAddress))
  proposal = proposal.concat(await updateSpotSourcesProposal(ownerAcc, stEthEthSource))
  proposal = proposal.concat(await orchestrateCompositeOracleProposal(ownerAcc, compositeOracle, timelock, cloak))
  proposal = proposal.concat(await updateCompositePairsProposal(ownerAcc, compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths))
  proposal = proposal.concat(await orchestrateAddedAssetProposal(ownerAcc, ladle, timelock, cloak, assets))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, witch, wand, cloak, ilks))
  proposal = proposal.concat(await addIlksToSeriesProposal(cauldron, seriesIlks))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
