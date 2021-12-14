import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { orchestrateYearnOracleProposal } from '../../../fragments/oracles/orchestrateYearnOracleProposal'
import { updateYearnSourcesProposal } from '../../../fragments/oracles/updateYearnSourcesProposal'
import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'

import { CompositeMultiOracle, YearnVaultMultiOracle, Timelock, EmergencyBrake } from '../../../../typechain'

import { COMPOSITE, YEARN, WAD } from '../../../../shared/constants'

import { deployer, developer } from './addYVUSDC.mainnet.config'
import { yearnSources, compositeSources, compositePaths } from './addYVUSDC.mainnet.config'

/**
 * @dev This script configures the YVUSDC price feed
 * Previously, the YearnOracle should have been deployed, and ROOT access
 * given to the Timelock.
 * Deploy the Yearn oracle
 * --- You are here ---
 * Configure the permissions for the Yearn Oracle
 * Add the YVUSDC/USDC yvToken as the YVUSDC/USDC source in the Yearn Oracle
 * Add the Yearn Oracle as the YVUSDC/USDC source in the Composite Oracle
 * Add the Chainlink Oracle as the DAI/USDC and ETH/USDC sources in the Composite Oracle
 * Add the DAI/USDC/YVUSDC and ETH/USDC/YVUSDC paths in the Composite Oracle
 */
 ;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  let ownerAcc = await getOwnerOrImpersonate(developer, WAD)

  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

  const compositeOracle = ((await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown) as CompositeMultiOracle
  const yearnOracle = ((await ethers.getContractAt(
    'YearnVaultMultiOracle',
    protocol.get(YEARN) as string,
    ownerAcc
  )) as unknown) as YearnVaultMultiOracle
  const cloak = ((await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown) as EmergencyBrake
  const timelock = ((await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown) as Timelock

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateYearnOracleProposal(deployer, yearnOracle, timelock, cloak))
  proposal = proposal.concat(await updateYearnSourcesProposal(yearnOracle, yearnSources))
  proposal = proposal.concat(await updateCompositeSourcesProposal(compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
