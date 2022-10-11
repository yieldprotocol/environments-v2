import { ethers } from 'hardhat'
import {
  readAddressMappingIfExists,
  proposeApproveExecute,
  getOwnerOrImpersonate,
} from '../../../../../../shared/helpers'

const { developer, deployer } = require(process.env.CONF as string)
const { protocol, governance, joins } = require(process.env.CONF as string)
const { orchestrateFCashWandProposal } = require(process.env.CONF as string)

const { oldDaiId, oldUsdcId, newDaiId, newUsdcId } = require(process.env.CONF as string)
const { newDaiSeriesId, newUSDCSeriesID } = require(process.env.CONF as string)

/**
 * @dev This script configures the Yield Protocol to use fCash as collateral.
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)
  console.log(`timelock: ${timelock.address}`)

  const fCashWand = await ethers.getContractAt('FCashWand', protocol.get('fCashWand') as string, ownerAcc)
  console.log(`fCashWand: ${fCashWand.address}`)

  // grab new Joins
  const daiNewJoin = await ethers.getContractAt('NotionalJoin', joins.get(newDaiId) as string, ownerAcc)
  console.log(`daiNewJoin: ${daiNewJoin.address}`)
  const usdcNewJoin = await ethers.getContractAt('NotionalJoin', joins.get(newUsdcId) as string, ownerAcc)
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
      .addfCashCollateral(newDaiId, joins.get(newDaiId) as string, oldDaiId, newDaiSeriesId)
    console.log(`Collateral added: FDAI2212`)

    // fCashWand - add collateral FUSDC2212, reference FUSDC2209
    await fCashWand
      .connect(ownerAcc)
      .addfCashCollateral(newUsdcId, joins.get(newUsdcId) as string, oldUsdcId, newUSDCSeriesID)
    console.log(`Collateral added: FUSDC2212`)
  } else {
    console.log(`adding collateral skipped`)
  }

  console.log(`completed`)
})()
