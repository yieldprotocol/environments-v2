import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'
import { addModuleProposal } from '../../../fragments/ladle/addModuleProposal'
import { Cauldron, EmergencyBrake, Join, Ladle, Timelock } from '../../../../typechain'

/**
 * @dev This script:
 * Adds convexLadleModule as amodule to Ladle, to allow `route`
 */

import { CVX3CRV } from '../../../../shared/constants'
import { removeLadlePermissionsProposal } from './removeLadlePermissionsProposal'
const { developer } = require(process.env.CONF as string)
;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw 'Only Kovan, Rinkeby and Mainnet supported'

  let ownerAcc = await getOwnerOrImpersonate(developer)
  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  const convexLadleModuleAddress: string = protocol.get('convexLadleModule') as string

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
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

  const join = (await ethers.getContractAt('Join', await ladle.joins(CVX3CRV), ownerAcc)) as Join

  let proposal: Array<{ target: string; data: string }> = []
  proposal = proposal.concat(await addModuleProposal(ladle, convexLadleModuleAddress))
  proposal = proposal.concat(await removeLadlePermissionsProposal(cauldron, ladle))
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
