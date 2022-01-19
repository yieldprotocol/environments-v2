import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../shared/helpers'

import { orchestrateYearnOracleProposal } from '../../fragments/oracles/orchestrateYearnOracleProposal'

import { YearnVaultMultiOracle, Timelock, EmergencyBrake } from '../../../typechain'

import { YEARN, WAD } from '../../../shared/constants'

import { deployer, developer } from './yvUSDC/addYVUSDC.mainnet.config'

/**
 * @dev This script orchestrates the YearnVaultMultiOracle
 *
 * --- deployYearnOracle.ts
 * Previously, the YearnOracle should have been deployed, and ROOT access
 * given to the Timelock.
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

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
