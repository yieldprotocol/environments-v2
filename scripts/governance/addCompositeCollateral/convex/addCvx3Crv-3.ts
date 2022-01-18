import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'

import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { Wand, Timelock } from '../../../../typechain'
import { CVX3CRV, WAD } from '../../../../shared/constants'
import { developer } from './addCvx3Crv.config'

/**
 * @dev This script adds cvx3Crv as an asset to the Yield Protocol.
 */
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)

  const governance = readAddressMappingIfExists('governance.json')
  const protocol = readAddressMappingIfExists('protocol.json')
  const convexYieldWrapperAddress: string = protocol.get('convexYieldWrapper') as string

  const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown as Wand

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal = await addAssetProposal(ownerAcc, wand, [[CVX3CRV, convexYieldWrapperAddress]])

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
