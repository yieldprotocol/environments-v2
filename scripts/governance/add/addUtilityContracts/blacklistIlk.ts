import { ethers } from 'hardhat'
import { Timelock, Giver } from '../../../../typechain'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../shared/helpers'
import { blacklistIlkProposal } from '../../../fragments/utils/blacklistIlkProposal'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
/**
 * @dev This script orchestrates the Cauldron

 */
export async function blacklistIlk() {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as unknown as Giver

  const proposal: Array<{ target: string; data: string }> = await blacklistIlkProposal(giver, '0x303100000000')

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
}
