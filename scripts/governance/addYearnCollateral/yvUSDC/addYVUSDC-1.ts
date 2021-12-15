import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'

import { orchestrateYearnOracleProposal } from '../../../fragments/oracles/orchestrateYearnOracleProposal'
import { updateYearnSourcesProposal } from '../../../fragments/oracles/updateYearnSourcesProposal'

import { YearnVaultMultiOracle, Timelock, EmergencyBrake } from '../../../../typechain'

import { YEARN, WAD } from '../../../../shared/constants'

import { deployer, developer } from './addYVUSDC.mainnet.config'
import { yearnSources } from './addYVUSDC.mainnet.config'

/**
 * @dev This script orchestrates and updates sources for YearnVaultMultiOracle
 *
 * --- deployYearnOracle.ts
 * Previously, the YearnOracle should have been deployed, and ROOT access
 * given to the Timelock.
 * --- You are here --- addYVUSDC-1.ts
 * Configure the permissions for the Yearn Oracle
 * Add the YVUSDC/USDC yvToken as the YVUSDC/USDC source in the Yearn Oracle
 * --- addYVUSDC-2.ts
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

  const yearnOracle = (await ethers.getContractAt(
    'YearnVaultMultiOracle',
    protocol.get(YEARN) as string,

  )) as unknown as YearnVaultMultiOracle

  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateYearnOracleProposal(deployer, yearnOracle, timelock, cloak))
  proposal = proposal.concat(await updateYearnSourcesProposal(yearnOracle, yearnSources))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
