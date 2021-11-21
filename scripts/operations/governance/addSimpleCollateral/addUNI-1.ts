import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { addAssetProposal } from '../../addAssetProposal'
import { Wand, Timelock } from '../../../../typechain'
import { UNI } from '../../../../shared/constants'

/**
 * @dev This script adds UNI as an asset.
 */
;(async () => {
  let chainId: number

  const uniAddress = new Map([
    [1, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
    [42, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  ]) // https://github.com/Uniswap/v3-periphery/blob/main/deploys.md

  chainId = await getOriginalChainId()
  if (chainId!=1) throw "Only Mainnet supported"
  const addedAssets: Array<[string, string]> = [[UNI, uniAddress.get(chainId) as string]]

  const developerIfImpersonating = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  const path = chainId == 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>

  const wand = ((await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown) as Wand
  const timelock = ((await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown) as Timelock

  let proposal = await addAssetProposal(ownerAcc, wand, addedAssets)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
