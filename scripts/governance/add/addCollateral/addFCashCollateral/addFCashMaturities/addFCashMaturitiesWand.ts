import { ethers } from 'hardhat'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../shared/helpers'

import { orchestrateFCashWandProposal } from '../../fragments/utils/orchestrateFCashWandProposal'
import { FDAI2209, FUSDC2209, FDAI2212, FUSDC2212 } from '../../../../shared/constants'
import { Timelock, FCashWand } from '../../../../typechain'

const {
  developer,
  deployer,
  newFUSDCJoinAddress,
  newFUSDCSeriesId,
  newFDAIJoinAddress,
  newFDAISeriesId,
} = require(process.env.CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const joins = readAddressMappingIfExists('newJoins.json')
  const governance = readAddressMappingIfExists('governance.json')

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const fCashWand = (await ethers.getContractAt(
    'FCashWand',
    governance.get('fCashWand') as string,
    ownerAcc
  )) as unknown as FCashWand

  let proposal: Array<{ target: string; data: string }> = []

  // Permissions
  proposal = proposal.concat(await orchestrateFCashWandProposal(ownerAcc, deployer, timelock))

  // fCashWand - add collateral FUSDC2212, reference FUSDC2209
  proposal.push({
    target: fCashWand.address,
    data: fCashWand.interface.encodeFunctionData('addfCashCollateral', [
      FUSDC2212,
      newFUSDCJoinAddress,
      FUSDC2209,
      newFUSDCSeriesId,
    ]),
  })

  // fCashWand - add collateral FDAI2212, reference FDAI2209
  proposal.push({
    target: fCashWand.address,
    data: fCashWand.interface.encodeFunctionData('addfCashCollateral', [
      FDAI2212,
      newFDAIJoinAddress,
      FDAI2209,
      newFDAISeriesId,
    ]),
  })

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
