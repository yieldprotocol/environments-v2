import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../shared/helpers'

import { makeBaseProposal } from '../../../../fragments/assetsAndSeries/makeBaseProposal'
import { updateIlkProposal } from '../../../../fragments/assetsAndSeries/updateIlkProposal'

import {
  IOracle,
  ChainlinkUSDMultiOracle,
  AccumulatorMultiOracle,
} from '../../../../../typechain'
import { Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../../../typechain'
const { developer, bases } = require(process.env.CONF as string)
const {
  chainlinkDebtLimits,
} = require(process.env.CONF as string)

/**
 * @dev This script orchestrates joins, adds assets to the Cauldron, and makes them into ilks and bases accordingly
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  const chainlinkUSDOracle = (await ethers.getContractAt(
    'ChainlinkUSDMultiOracle',
    protocol.get('chainlinkUSDOracle') as string,
    ownerAcc
  )) as unknown as ChainlinkUSDMultiOracle
  const accumulatorOracle = (await ethers.getContractAt(
    'AccumulatorMultiOracle',
    protocol.get('accumulatorOracle') as string,
    ownerAcc
  )) as unknown as AccumulatorMultiOracle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
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

  proposal = proposal.concat(
    await makeBaseProposal(ownerAcc, accumulatorOracle as unknown as IOracle, cauldron, ladle, witch, cloak, bases)
  )

  proposal = proposal.concat(
    await updateIlkProposal(
      chainlinkUSDOracle as unknown as IOracle,
      cauldron,
      chainlinkDebtLimits,
    )
  )

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
