import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../../shared/helpers'

import { Witch, Timelock } from '../../../../../../typechain'
import { updateInitialOfferProposal } from '../../../../../fragments/liquidations/updateInitialOfferProposal'

const { developer, deployer, assets } = require(process.env.CONF as string)
const { initalOffers } = require(process.env.CONF as string)

/**
 * @dev This script updates the initial offer
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  let proposal: Array<{ target: string; data: string }> = []

  proposal = await updateInitialOfferProposal(witch, initalOffers)
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
