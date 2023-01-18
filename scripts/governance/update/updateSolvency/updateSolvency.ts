import { ethers } from 'hardhat'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'

import { updateCompositeSourcesProposal } from '../../../fragments/oracles/updateCompositeSources'
import { updateCompositePathsProposal } from '../../../fragments/oracles/updateCompositePaths'
import { updateSpotOraclesProposal } from '../../../fragments/oracles/updateCollateralization'

import { COMPOSITE } from '../../../../shared/constants'

const { developer } = require(process.env.CONF as string)
const { protocol, governance, newCompositeSources, newCompositePaths, newSpotOracles } = require(process.env
  .CONF as string)
/**
 * @dev This script orchestrates and updates the Solvency contract
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc)

  const compositeOracle = await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )
  const solvency = await ethers.getContractAt('Solvency', protocol.get('solvency') as string, ownerAcc)

  let proposal: Array<{ target: string; data: string }> = []

  proposal = proposal.concat(await updateCompositeSourcesProposal(ownerAcc, compositeOracle, newCompositeSources))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))
  proposal = proposal.concat(await updateSpotOraclesProposal(cauldron, newSpotOracles))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
