import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { ROOT } from '../../../../shared/constants'
import { Timelock, Giver, Cauldron } from '../../../../typechain'
import { getOwnerOrImpersonate, propose } from '../../../../shared/helpers'
import { orchestrateGiverProposal } from '../../../fragments/utils/orchestrateGiverProposal'
const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates the giver
 * The giver gets give access on cauldron. timelock gets access to blacklistIlk.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const giver = (await ethers.getContractAt('Giver', protocol.get('giver') as string, ownerAcc)) as unknown as Giver
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const proposal: Array<{ target: string; data: string }> = await orchestrateGiverProposal(
    giver,
    cauldron,
    timelock,
    deployer
  )

  await propose(timelock, proposal, developer)
})()
