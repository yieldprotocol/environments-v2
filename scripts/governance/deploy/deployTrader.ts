import { ethers, waffle } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate, verify } from '../../../shared/helpers'

import TraderArtifact from '../../../artifacts/contracts/Trader.sol/Trader.json'
const { external, protocol, developer } = require(process.env.CONF as string)

const { deployContract } = waffle

/**
 * @dev This script deploys the Trader
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  let trader
  const eulerFlash = external.get('eulerFlash') as string
  if (protocol.get('trader') === undefined) {
    trader = await deployContract(ownerAcc, TraderArtifact, [eulerFlash])
    console.log(`Trader deployed at ${trader.address}`)
    verify(trader.address, [eulerFlash])
  } else {
    trader = await ethers.getContractAt('Trader', protocol.get('trader') as string, ownerAcc)
    console.log(`Reusing Trader at ${trader.address}`)
  }

  protocol.set('trader', trader.address)

  writeAddressMap('protocol.json', protocol)
})()
