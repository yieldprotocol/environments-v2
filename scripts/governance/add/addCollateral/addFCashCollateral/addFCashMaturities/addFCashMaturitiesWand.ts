import { ethers } from 'hardhat'
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
const newDaiSeriesId = '0x303130380000'
const newUSDCSeriesID = '0x303230380000'
import { id } from '@yield-protocol/utils-v2'

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')
  const governance = readAddressMappingIfExists('governance.json')
  const joins = readAddressMappingIfExists('joins.json')

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  console.log(`timelock: ${timelock.address}`)

  const fCashWand = await ethers.getContractAt('FCashWand', protocol.get('fCashWand') as string, ownerAcc)
  console.log(`fCashWand: ${fCashWand.address}`)

  // grab new Joins
  const daiNewJoin = await ethers.getContractAt('NotionalJoin', joins.get(FDAI2212) as string, ownerAcc)
  console.log(`daiNewJoin: ${daiNewJoin.address}`)

  const usdcNewJoin = await ethers.getContractAt('NotionalJoin', joins.get(FUSDC2212) as string, ownerAcc)
  console.log(`usdcNewJoin: ${usdcNewJoin.address}`)

  let proposal: Array<{ target: string; data: string }> = []

  // Permissions
  proposal = proposal.concat(await orchestrateFCashWandProposal(ownerAcc, deployer, timelock))

  // set activate accordingly
  const activateProposal: boolean = false
  const activateCollateral: boolean = true

  if (activateProposal) {
    console.log(`activate proposal`)
    if (proposal.length > 0) {
      // Propose, Approve & execute
      await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
    }
    console.log(`orchestrateFCashWandProposal completed`)
  } else {
    console.log(`proposal skipped`)
  }

  if (activateCollateral) {
    console.log(`activate collateral`)

    // addfCashCollateral(bytes6 assetId, address joinAddress, bytes6 oldAssetId, bytes6 seriedId)
    // fCashWand - add collateral FDAI2212, reference FDAI2209
    await fCashWand
      .connect(ownerAcc)
      .addfCashCollateral(FDAI2212, joins.get(FDAI2212) as string, FDAI2209, newDaiSeriesId, {
        gasLimit: 10_000_000,
      })
    console.log(`Collateral added: FDAI2212`)

    // fCashWand - add collateral FUSDC2212, reference FUSDC2209
    await fCashWand
      .connect(ownerAcc)
      .addfCashCollateral(FUSDC2212, joins.get(FUSDC2212) as string, FUSDC2209, newUSDCSeriesID, {
        gasLimit: 10_000_000,
      })
    console.log(`Collateral added: FUSDC2212`)
  } else {
    console.log(`adding collateral skipped`)
  }

  console.log(`completed`)
})()
