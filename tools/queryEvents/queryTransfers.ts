import { getOwnerOrImpersonate } from '../../shared/helpers'
const { developer } = require(process.env.CONF as string)


import { ERC20__factory } from '../../typechain'
const { strategies } = require(process.env.CONF as string)

/**
 * @dev This script can be used to query transfers.
 * 1. Update the addresses const to point at an array of addresses to query.
 * 2. Update the factory const to point at the contract factory for the contract you are querying (import it above)
 * 3. Update the filter const to point at the event you are querying (import it above).
 * 4. Update the console logs to display the information desired.
 *
*/
;(async () => {
  const ownerAcc = await getOwnerOrImpersonate(developer)

  const addresses = strategies.values() // This is the list of addresses that will be iterated through

  const factory = ERC20__factory
  for (let addr of addresses) {
    const contract = factory.connect(addr, ownerAcc)

    /**
     * The value after `.filters.` is the event that will be iterated through.
     * Each argument represents an indexed topic in the event.
     * For additional filtering, null can be replaced with the value to filter on (for example only retrieve events
     * where the first argument is equal to a specific address)
     * For more information see: https://docs.ethers.org/v5/concepts/events/
     */
    const filter = contract.filters.Transfer(null, null, null)

    const events = await contract.queryFilter(filter);
    if (events.length) {
      console.log(events.length);
      console.log(`address:${contract.address}`)
      for (let event of events) {
        console.log(event.args[0], event.args[1], event.args[2].toString())
      }
    }
  }
})()
