import { ethers } from 'hardhat'
import { getOwnerOrImpersonate } from '../../shared/helpers'
const { developer, protocol } = require(process.env.CONF as string)

import { Cauldron__factory, Witch__factory } from '../../typechain'
import { CAULDRON, WITCH } from '../../shared/constants'

/**
 * @dev This script can be used to query auctioned vaults.
 * 1. Update the addresses const to point at an array of addresses to query.
 * 2. Update the factory const to point at the contract factory for the contract you are querying (import it above)
 * 3. Update the filter const to point at the event you are querying (import it above).
 * 4. Update the console logs to display the information desired.
 *
*/
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)


  const cauldron = Cauldron__factory.connect(protocol.getOrThrow(CAULDRON), ownerAcc)
  const witch = Witch__factory.connect(protocol.getOrThrow(WITCH), ownerAcc)
    
  /**
   * The value after `.filters.` is the event that will be iterated through.
   * Each argument represents an indexed topic in the event.
   * For additional filtering, null can be replaced with the value to filter on (for example only retrieve events
   * where the first argument is equal to a specific address)
   * For more information see: https://docs.ethers.org/v5/concepts/events/
   */
  // const vaultId = '0x8edfc9ca0d23850529b76d82' // Set to null to query all vaults
  const filter = witch.filters.Bought(null, null, null, null)

  const events = await witch.queryFilter(filter);
  if (events.length) {
    for (let event of events) {
      const txHash = event.transactionHash
      const tx = await ethers.provider.getTransaction(txHash)
      const vaultId = event.args[0]
      const vault = await cauldron.vaults(vaultId)
      console.log(tx.blockNumber, tx.from, event.transactionHash, event.args[0], event.args[1], vault.ilkId, event.args[2].toString(), vault.seriesId, event.args[3].toString())
    }
  }
})()
