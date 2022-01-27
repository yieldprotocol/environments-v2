import { ethers } from 'hardhat'
import { readAddressMappingIfExists } from '../../shared/helpers'

import { Witch } from '../../typechain/Witch'

;(async () => {
  const [ownerAcc] = await ethers.getSigners()

  const protocol = readAddressMappingIfExists('protocol.json');

  // Contract instantiation
  const witch = (await ethers.getContractAt(
    'Witch',
    protocol.get('witch') as string,
    ownerAcc
  )) as unknown as Witch

  const filter = witch.filters.Auctioned(null, null)
  const events = await witch.queryFilter(filter)
  console.log(events)

})()
