import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { addAssetProposal } from '../../fragments/assetsAndSeries/addAssetProposal'
import { Wand, Timelock } from '../../../typechain'

import { addAssets,developerIfImpersonating } from './addUNICollateral.config'
/**
 * @dev This script adds UNI as an asset.
 */
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)

  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const addedAssets: Array<[string, string]> = addAssets(chainId)

  const wand = ((await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown) as Wand
  const timelock = ((await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown) as Timelock

  let proposal = await addAssetProposal(ownerAcc, wand, addedAssets)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
