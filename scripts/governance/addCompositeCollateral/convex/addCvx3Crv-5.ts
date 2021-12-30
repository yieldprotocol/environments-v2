import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'
import { addIntegrationProposal } from '../../../fragments/ladle/addIntegrationProposal'
import { addTokenProposal } from '../../../fragments/ladle/addTokenProposal'
import { addModuleProposal } from '../../../fragments/ladle/addModuleProposal'
import { Cauldron, EmergencyBrake, Join, Ladle, Timelock } from '../../../../typechain'
import { developer } from './addCvx3Crv.config'

/**
 * @dev This script:
 * Adds convexLadleModule as amodule to Ladle, to allow `route`
 */

 ;import { ConvexStakingWrapperYield } from '../../../../typechain/ConvexStakingWrapperYield'
import { CVX3CRV } from '../../../../shared/constants'
import { pointCollateralVaultProposal } from '../../../fragments/utils/pointCollateralVaultProposal'
import { orchestrateConvexWrapperProposal } from '../../../fragments/utils/orchestrateConvexWrapperProposal'
(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const convexLadleModuleAddress: string = protocol.get('convexLadleModule') as string
  
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const convexStakingWrapperYield = (await ethers.getContractAt(
    'ConvexStakingWrapperYield',
    protocol.get('convexStakingWrapperYield') as string,
    ownerAcc
  )) as unknown as ConvexStakingWrapperYield
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake

  const join = (await ethers.getContractAt('Join', await ladle.joins(CVX3CRV), ownerAcc)) as Join

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addModuleProposal(ladle, convexLadleModuleAddress))
  proposal = proposal.concat(await addIntegrationProposal(ladle,convexStakingWrapperYield.address))
  proposal = proposal.concat(await orchestrateConvexWrapperProposal(ownerAcc.address,convexStakingWrapperYield,timelock,cloak))
  proposal = proposal.concat(await pointCollateralVaultProposal(convexStakingWrapperYield,join.address))
  proposal = proposal.concat(await addTokenProposal(ladle, '0x30d9410ed1d5da1f6c8391af5338c93ab8d4035c'))// cvx3Crv

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
