import { ethers } from 'hardhat'
import { contangoCauldron_key, contangoLadle_key } from '../../../../../shared/constants'
import { proposeApproveExecute, getOwnerOrImpersonate } from '../../../../../shared/helpers'

import { orchestrateCauldronProposal } from '../../../../fragments/core/orchestrateCauldronProposal'
import { orchestrateLadleProposal } from '../../../../fragments/core/orchestrateLadleProposal'
import { orchestrateCompositeOracleProposal } from '../../../../fragments/oracles/orchestrateCompositeOracleProposal'

const { protocol, governance } = require(process.env.CONF as string)
const { deployer, developer } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the Cauldron, Ladle, Witch (and Wand?)
 */

;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer as string)

  const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc)
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  const contangoCauldron = await ethers.getContractAt(
    'Cauldron',
    protocol.get(contangoCauldron_key) as string,
    ownerAcc
  )
  const contangoLadle = await ethers.getContractAt('Ladle', protocol.get(contangoLadle_key) as string, ownerAcc)
  const compositeMultiOracle = await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )

  // Build the proposal
  const proposal = [
    await orchestrateCauldronProposal(deployer as string, contangoCauldron, timelock, cloak),
    await orchestrateLadleProposal(deployer as string, contangoCauldron, contangoLadle, timelock, cloak),
    await orchestrateCompositeOracleProposal(ownerAcc, compositeMultiOracle, timelock, cloak),
  ].flat(1)

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
})()
