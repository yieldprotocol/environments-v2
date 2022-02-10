import { ethers } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../shared/helpers'

import { makeBaseProposal } from '../../../fragments/assetsAndSeries/makeBaseProposal'
import { updateIlkProposal } from '../../../fragments/assetsAndSeries/updateIlkProposal'

import {
  IOracle,
  ChainlinkMultiOracle,
  CompositeMultiOracle,
  UniswapV3Oracle,
  CompoundMultiOracle,
} from '../../../../typechain'
import { Cauldron, Ladle, Witch, Timelock, EmergencyBrake } from '../../../../typechain'
const { developer, deployer, assets, bases } = require(process.env.CONF as string)
const { newChainlinkLimits, newUniswapLimits, newCompositeLimits } = require(process.env.CONF as string)

/**
 * @dev This script orchestrates joins, adds assets to the Cauldron, and makes them into ilks and bases accordingly
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  const chainlinkOracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const uniswapOracle = (await ethers.getContractAt(
    'UniswapV3Oracle',
    protocol.get('uniswapOracle') as string,
    ownerAcc
  )) as unknown as UniswapV3Oracle
  const compoundOracle = (await ethers.getContractAt(
    'CompoundMultiOracle',
    protocol.get('compoundOracle') as string,
    ownerAcc
  )) as unknown as CompoundMultiOracle
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
    await makeBaseProposal(ownerAcc, compoundOracle as unknown as IOracle, cauldron, ladle, witch, cloak, bases)
  )

  proposal = proposal.concat(
    await updateIlkProposal(chainlinkOracle as unknown as IOracle, cauldron, newChainlinkLimits)
  )
  proposal = proposal.concat(
    await updateIlkProposal(uniswapOracle as unknown as IOracle, cauldron, newUniswapLimits)
  )
  proposal = proposal.concat(
    await updateIlkProposal(compositeOracle as unknown as IOracle, cauldron, newCompositeLimits)
  )

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
