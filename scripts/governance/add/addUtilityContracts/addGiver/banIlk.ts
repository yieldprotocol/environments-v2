import { ethers } from 'hardhat'
import { Timelock, Giver } from '../../../../../typechain'
import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../shared/helpers'
import { banIlkProposal } from '../../../../fragments/utils/banlkProposal'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)
/**
 * @dev This script orchestrates the Cauldron

 */
export async function banIlk() {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as unknown as Giver

  const proposal: Array<{ target: string; data: string }> = await banIlkProposal(giver, '0x303100000000', true)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
}
