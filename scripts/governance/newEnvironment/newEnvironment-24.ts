import { ethers } from 'hardhat'
import { readAddressMappingIfExists, proposeApproveExecute, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'
import { COMPOUND, CHAINLINK, COMPOSITE } from '../../../../shared/constants'

import { makeBaseProposal } from '../../../fragments/assetsAndSeries/makeBaseProposal'
import { makeIlkProposal } from '../../../fragments/assetsAndSeries/makeIlkProposal'
import { orchestrateAddedAssetProposal } from '../../../fragments/assetsAndSeries/orchestrateAddedAssetProposal'
import { developer, assetsToAdd } from './newEnvironment.config'
import { bases, chainlinkLimits, compositeLimits } from './newEnvironment.config'

import { IOracle, Ladle, Witch, Wand, EmergencyBrake, Timelock } from '../../../../typechain'


/**
 * @dev This script orchestrates Joins, makes bases and makes ilks.
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  const governance = readAddressMappingIfExists('governance.json');
  const protocol = readAddressMappingIfExists('protocol.json');

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

  const compoundOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(COMPOUND) as string,
    ownerAcc
  )) as unknown as IOracle
  const chainlinkOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(CHAINLINK) as string,
    ownerAcc
  )) as unknown as IOracle
  const compositeOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown as IOracle

  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch
  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await orchestrateAddedAssetProposal(ownerAcc, ladle, timelock, cloak, assetsToAdd.get(chainId) as [string, string][]))
  proposal = proposal.concat(await makeBaseProposal(ownerAcc, compoundOracle, ladle, witch, wand, cloak, bases.get(chainId) as string[]))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, chainlinkOracle, ladle, witch, wand, cloak, chainlinkLimits))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, compositeOracle, ladle, witch, wand, cloak, compositeLimits))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
