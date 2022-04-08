import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate } from '../../../../../shared/helpers'

import { addAssetProposal } from '../../addAssetProposal'
import { reserveAssetProposal } from '../../reserveAssetProposal'
import { Cauldron, Wand, Timelock } from '../../../../../typechain'
import { WSTETH, STETH } from '../../../../../shared/constants'

/**
 * @dev This script adds WstETH as an asset to the Cauldron as part of ypp-0007.
 */
;(async () => {
  const wstEthAddress: string = '0xB12C63eD91e901995E68023293AC1A308ffA6c3c' // https://docs.lido.fi/deployed-contracts
  const stEthAddress: string = '0x2296AB4F92f7fADC78eD02A9576B9a779CAa91bE' // https://docs.lido.fi/deployed-contracts

  const addedAssets: Array<[string, string]> = [[WSTETH, wstEthAddress]]
  const reservedAssets: Array<[string, string]> = [[STETH, stEthAddress]]

  const developerIfImpersonating = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)

  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown as Wand
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal = await addAssetProposal(ownerAcc, wand, addedAssets)
  proposal = proposal.concat(await reserveAssetProposal(ownerAcc, cauldron, reservedAssets))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
