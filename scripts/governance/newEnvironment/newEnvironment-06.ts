import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId, getNetworkName } from '../../../shared/helpers'

import { orchestrateCloakProposal } from '../../fragments/core/governance/orchestrateCloakProposal'
import {grantGovernorProposal} from '../../fragments/permissions/grantGovernorProposal'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { WAD } from '../../../shared/constants'
// import { deployer, developer } from './newEnvironment.rinkeby.config'

/**
 * @dev This script orchestratese the Cloak
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"

  const config = await import(`./newEnvironment.${getNetworkName()}.config`)
  const { deployer, developer } = config;

  let ownerAcc = await getOwnerOrImpersonate(developer as string, WAD)

  const governance = readAddressMappingIfExists('governance.json');

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

  if (getNetworkName() == 'localhost') {
    const proposal: Array<{ target: string; data: string }> = await grantGovernorProposal(timelock, cloak, governance.get('multisig') as string);
    // Propose, Approve & execute
    for (let i = 0; i < 3; i++) {
      await proposeApproveExecute(timelock, proposal, ownerAcc.address)
    }
  }
})()
