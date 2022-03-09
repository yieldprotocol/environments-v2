import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
  getNetworkName,
} from '../../../shared/helpers'

import { orchestrateCloakProposal } from '../../fragments/core/governance/orchestrateCloakProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { WAD } from '../../../shared/constants'
const { developer,deployer } = require(process.env.CONF as string)
// import { deployer, developer } from './newEnvironment.rinkeby.config'

/**
 * @dev This script orchestrates the Cloak
 */
;(async () => {
  const chainId = await getOriginalChainId()

  // const config = await import(`./newEnvironment.${getNetworkName()}.config`)
  // const { deployer, developer } = config
  console.log(getNetworkName())
  let ownerAcc = await getOwnerOrImpersonate(developer as string, WAD)

  const governance = readAddressMappingIfExists('governance.json')

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

  // Build the proposal
  const proposal: Array<{ target: string; data: string }> = await orchestrateCloakProposal(
    deployer as string,
    timelock,
    cloak
  )

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
