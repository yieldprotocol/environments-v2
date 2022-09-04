import { ethers } from 'hardhat'
import * as fs from 'fs'
import {
  getOriginalChainId,
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
  jsonToMap,
} from '../../../../../../shared/helpers'

import { orchestrateFCashWandProposal } from '../../../../../../scripts/fragments/utils/orchestrateFCashWandProposal'
import { FDAI2209, FUSDC2209, FDAI2212, FUSDC2212 } from '../../../../../../shared/constants'
import { Timelock, FCashWand } from '../../../../../../typechain'

const { developer, deployer } = require(process.env.CONF as string)
// Dec series
const pools = jsonToMap(fs.readFileSync(`./addresses/pools.json`, 'utf8')) as Map<string, string>
const joins = jsonToMap(fs.readFileSync(`./addresses/joins.json`, 'utf8')) as Map<string, string>

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  console.log(`timelock: ${timelock.address}`)

  const fCashWand = (await ethers.getContractAt(
    'FCashWand',
    protocol.get('fCashWand') as string,
    ownerAcc
  )) as unknown as FCashWand
  console.log(`fCashWand: ${fCashWand.address}`)

  let proposal: Array<{ target: string; data: string }> = []

  // Permissions
  proposal = proposal.concat(await orchestrateFCashWandProposal(ownerAcc, deployer, timelock))

  if (proposal.length > 0) {
    // Propose, Approve & execute
    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
  }
  console.log(`orchestrateFCashWandProposal completed`)

  // fCashWand - add collateral FDAI2212, reference FDAI2209
  await fCashWand.addfCashCollateral(
    FDAI2212,
    joins.get('FDAI2212') as string,
    FDAI2209,
    pools.get('0x303130380000') as string
  )
  console.log(`Collateral added: FDAI2212`)

  // fCashWand - add collateral FUSDC2212, reference FUSDC2209
  await fCashWand.addfCashCollateral(
    FUSDC2212,
    joins.get('FUSDC2212') as string,
    FUSDC2209,
    pools.get('0x303230380000') as string
  )
  console.log(`Collateral added: FUSDC2212`)

  console.log(`completed`)
})()
