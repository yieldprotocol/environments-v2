import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOriginalChainId, proposeApproveExecute, getOwnerOrImpersonate } from '../../../shared/helpers'

import { addAssetProposal } from '../../fragments/assetsAndSeries/addAssetProposal'
import { Wand, Timelock } from '../../../typechain'
import { developer, assetToAdd } from './addUNI.config'

/**
 * @dev This script adds as an asset.
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');


  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal = await addAssetProposal(ownerAcc, wand, [assetToAdd.get(chainId) as [string, string]])

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
