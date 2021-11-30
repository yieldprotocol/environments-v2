import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, getOwnerOrImpersonate, getOriginalChainId, proposeApproveExecute } from '../../../shared/helpers'

import { updateChiSourceProposal } from '../../fragments/oracles/updateChiSourceProposal'
import { updateRateSourceProposal } from '../../fragments/oracles/updateRateSourceProposal'
import { updateCompositePathsProposal } from '../../fragments/oracles/updateCompositePathsProposal'
import { makeBaseProposal } from '../../fragments/makeBaseProposal'
import { makeIlkProposal } from '../../fragments/makeIlkProposal'
import { addSeriesProposal } from '../../fragments/assetsAndSeries/addSeriesProposal'
import { IOracle, CompoundMultiOracle, CompositeMultiOracle, Ladle, Witch, Wand, EmergencyBrake, Timelock } from '../../../typechain'
import { WAD } from '../../../shared/constants'
import { COMPOUND, CHAINLINK, COMPOSITE, newChiSources, newRateSources, newCompositePaths, newBases, newChainlinkIlks, newCompositeIlks, newSeries } from './addEthSeries.config'

/**
 * @dev This script deploys two strategies to be used for Ether
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>

  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const lendingOracle = (await ethers.getContractAt(
    'CompoundMultiOracle',
    protocol.get(COMPOUND) as string,
    ownerAcc
  )) as unknown as CompoundMultiOracle
  const spotOracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(CHAINLINK) as string,
    ownerAcc
  )) as unknown as IOracle
  const compositeOracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get(COMPOSITE) as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle
  const wand = (await ethers.getContractAt(
    'Wand',
    protocol.get('wand') as string,
    ownerAcc
  )) as unknown as Wand
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake


  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await updateChiSourceProposal(ownerAcc, lendingOracle, newChiSources.get(chainId) as [string, string][]))
  proposal = proposal.concat(await updateRateSourceProposal(ownerAcc, lendingOracle, newRateSources.get(chainId) as [string, string][]))
  proposal = proposal.concat(await updateCompositePathsProposal(compositeOracle, newCompositePaths))
  proposal = proposal.concat(await makeBaseProposal(ownerAcc, lendingOracle as unknown as IOracle, ladle, wand, witch, cloak, newBases))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, spotOracle, ladle, witch, wand, cloak, newChainlinkIlks))
  proposal = proposal.concat(await makeIlkProposal(ownerAcc, compositeOracle as unknown as IOracle, ladle, witch, wand, cloak, newCompositeIlks))
  proposal = proposal.concat(await addSeriesProposal(wand, newSeries))

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
