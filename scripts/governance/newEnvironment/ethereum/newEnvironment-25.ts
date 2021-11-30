import { ethers } from 'hardhat'
import { readAddressMappingIfExists, getOwnerOrImpersonate, getOriginalChainId, proposeApproveExecute } from '../../../../shared/helpers'

import { addSeriesProposal } from '../../../fragments/assetsAndSeries/addSeriesProposal'
import { Timelock, Wand } from '../../../../typechain'
import { developer, series } from './newEnvironment.config'

/**
 * @dev This script deploys two strategies to be used for Ether
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Rinkeby, Kovan and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addSeriesProposal(wand, series))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
