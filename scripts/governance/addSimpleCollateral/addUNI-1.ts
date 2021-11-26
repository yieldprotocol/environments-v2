import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { addAssetProposal } from '../../addAssetProposal'
import { Wand, Timelock } from '../../../../typechain'

import { addAssets,developerIfImpersonating } from './addUNICollateral.config'
/**
 * @dev This script adds UNI as an asset.
 */
;(async () => {
  let chainId: number

  chainId = await getOriginalChainId()
  
  const addedAssets: Array<[string, string]> = addAssets(chainId)

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
