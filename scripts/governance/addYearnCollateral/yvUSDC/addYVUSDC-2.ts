import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'

import { addAssetProposal } from '../../../fragments/assetsAndSeries/addAssetProposal'
import { Wand, Timelock } from '../../../../typechain'
import { WAD } from '../../../../shared/constants'
import { developer } from './addYVUSDC.mainnet.config'
import { assetsToAdd } from './addYVUSDC.mainnet.config'

/**
 * @dev This script adds Add YVUSDC as an asset using the Wand
 *
 * --- deployYearnOracle.ts
 * Previously, the YearnOracle should have been deployed, and ROOT access
 * given to the Timelock.
 * --- addYVUSDC-1.ts
 * Configure the permissions for the Yearn Oracle
 * Add the YVUSDC/USDC yvToken as the YVUSDC/USDC source in the Yearn Oracle
 * --- You are here --- addYVUSDC-2.ts
 * Add YVUSDC as an asset to the Yield Protocol using the Wand
 * --- addYVUSDC-3.ts
 * Permission the YVUSDCJoin
 * Make YVUSDC into an Ilk
 * Approve YVUSDC as collateral for USDC series
 */
 ;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)

  const governance = readAddressMappingIfExists('governance.json')
  const protocol = readAddressMappingIfExists('protocol.json')

  const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown as Wand
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal = await addAssetProposal(ownerAcc, wand, assetsToAdd)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
