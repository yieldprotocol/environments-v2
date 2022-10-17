/**
 * @dev This script tests the dust limits for one or more base/ilk pairs.
 *
 * It takes as inputs the protocol address files.
 */

import { ethers } from 'hardhat'
import { DISPLAY_NAMES } from '../../../../shared/constants'

import { getOwnerOrImpersonate, getOriginalChainId, getGovernanceProtocolAddresses } from '../../../../shared/helpers'
import { OldWitch, Cauldron } from '../../../../typechain'
const { protocol, developer, newDebtMin, newAuctionMin } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer.get(1))

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  console.log()
  console.log('Post deployment state testing')
  console.log('=============================')
  console.log()
  console.log('Debt Limits (dust)')
  for (let [baseId, ilkId, minDebt] of newDebtMin) {
    const debt = await cauldron.debt(baseId, ilkId)
    if (debt.min.toString() === minDebt.toString())
      console.log(`Success! ${DISPLAY_NAMES.get(baseId)}/${DISPLAY_NAMES.get(ilkId)} set to: ${debt.min}`)
    else console.log(`${DISPLAY_NAMES.get(baseId)}/${DISPLAY_NAMES.get(ilkId)} **NOT UPDATED** still at ${debt.min}`)
  }
  console.log()

  console.log('Auction Limits (dust)')
  const witch = (await ethers.getContractAt(
    'OldWitch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as OldWitch

  for (let [ilkId, dust] of newAuctionMin) {
    const ilk = await witch.ilks(ilkId)
    const limits = await witch.limits(ilkId)
    if (limits.dust.toString() === dust.toString())
      console.log(`Success! ${DISPLAY_NAMES.get(ilkId)} set to: ${limits.dust}`)
    else console.log(`${DISPLAY_NAMES.get(ilkId)} **NOT UPDATED** still at ${limits.dust}`)
  }
})()
