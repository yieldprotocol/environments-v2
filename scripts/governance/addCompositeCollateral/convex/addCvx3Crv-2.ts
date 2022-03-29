import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'

import { orchestrateCvx3CrvOracleProposal } from '../../../fragments/oracles/orchestrateCvx3CrvOracleProposal'
import { updateCvx3CrvOracleSourcesProposal } from '../../../fragments/oracles/updateCvx3CrvOracleSourcesProposal'
import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSourcesProposal'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePathsProposal'

import { CompositeMultiOracle, Timelock, EmergencyBrake } from '../../../../typechain'
import { Cvx3CrvOracle } from '../../../../typechain/Cvx3CrvOracle'
import { COMPOSITE, CONVEX3CRV, WAD } from '../../../../shared/constants'

import { developer } from './addCvx3Crv.config'
import { cvx3CrvSources, compositeSources, compositePaths } from './addCvx3Crv.config'

/**
 * @dev This script configures the Cvx3crv price feed
 * Previously, the Cvx3crvOracle should have been deployed, and ROOT access
 * given to the Timelock.
 * Deploy the Cvx3crv oracle
 * --- You are here ---
 * Configure the permissions for the Cvx3crv Oracle
 * Add the YVUSDC/USDC yvToken as the YVUSDC/USDC source in the Yearn Oracle
 * Add the Cvx3crv Oracle as the CVX3CRV/ETH source in the Composite Oracle
 * Add the Chainlink Oracle as the DAI/ETH and USDC/ETH sources in the Composite Oracle
 * Add the DAI/CVX3CRV/ETH and USDC/CVX3CRV/ETH paths in the Composite Oracle
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const governance = readAddressMappingIfExists('governance.json')
  const protocol = readAddressMappingIfExists('protocol.json')

  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const cvx3CrvOracle = (await ethers.getContractAt(
    'Cvx3CrvOracle',
    protocol.get(CONVEX3CRV) as string,
    ownerAcc
  )) as unknown as Cvx3CrvOracle
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
  proposal = proposal.concat(await orchestrateCvx3CrvOracleProposal(ownerAcc.address, cvx3CrvOracle, timelock, cloak))
  proposal = proposal.concat(await updateCvx3CrvOracleSourcesProposal(cvx3CrvOracle, cvx3CrvSources))
  proposal = proposal.concat(await updateCompositeSourcesProposal(compositeOracle, compositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, compositePaths))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
