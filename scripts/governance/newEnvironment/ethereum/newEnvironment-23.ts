import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { reserveAssetProposal } from '../../../fragments/assetsAndSeries/reserveAssetProposal'
import { Cauldron, Wand, Timelock } from '../../../../typechain'
import { developer, assetsToAdd, assetsToReserve } from './newEnvironment.config'

/**
 * @dev This script adds assets to the Yield Protocol.
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw 'Only Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
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

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addAssetProposal(ownerAcc, wand, assetsToAdd.get(chainId)))
  proposal = proposal.concat(await reserveAssetProposal(ownerAcc, cauldron, assetsToReserve.get(chainId)))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
