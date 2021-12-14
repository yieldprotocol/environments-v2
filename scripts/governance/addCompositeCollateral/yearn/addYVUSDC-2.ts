import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { Wand, Timelock } from '../../../../typechain'
import { WAD } from '../../../../shared/constants'
import { developer } from './addYVUSDC.mainnet.config'
import { assetsToAdd } from './addYVUSDC.mainnet.config'

/**
 * @dev This script adds YVUSDC as an asset to the Yield Protocol.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)

  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

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

  let proposal = await addAssetProposal(ownerAcc, wand, assetsToAdd)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
