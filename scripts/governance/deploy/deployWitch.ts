import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'
import { TIMELOCK, CAULDRON, LADLE, WITCH } from '../../../shared/constants'

import { deployWitch } from '../../fragments/core/deployWitch'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

import { Timelock__factory, Cauldron__factory, Ladle__factory, Witch__factory, Witch } from '../../../typechain'

/**
 * @dev This script deploys the Witch
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, ownerAcc)
  const cauldron = Cauldron__factory.connect(protocol.get(CAULDRON)!, ownerAcc)
  const ladle = Ladle__factory.connect(protocol.get(LADLE)!, ownerAcc)

  const witchAddress = protocol.get(WITCH)
  let witch: Witch
  if (witchAddress === undefined) {
    witch = await deployWitch(ownerAcc, timelock, cauldron, ladle)
    protocol.set(WITCH, witch.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    witch = Witch__factory.connect(protocol.get(WITCH)!, ownerAcc)
    console.log(`Reusing witch at: ${witch.address}`)
  }
})()
