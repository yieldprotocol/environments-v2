import { getOwnerOrImpersonate } from '../../../shared/helpers'
import { Contract } from 'ethers'
import { TIMELOCK, CAULDRON, LADLE, WITCH } from '../../../shared/constants'

import { deploy } from '../../fragments/deploy'
const { protocol, governance } = require(process.env.CONF as string)
const { deployer } = require(process.env.CONF as string)

import { Timelock__factory, Witch__factory } from '../../../typechain'

/**
 * @dev This script deploys the Witch
 */
;(async () => {
  let deployerAcc = await getOwnerOrImpersonate(deployer as string)

  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, deployerAcc)

  const witchAddress = protocol.get(WITCH)
  let witch: Contract
  if (witchAddress === undefined) {
    witch = await deploy(
      deployerAcc,
      timelock,
      'protocol.json',
      '@yield-protocol/vault-v2/contracts/Witch.sol:Witch',
      WITCH,
      [protocol.get(CAULDRON)!, protocol.get(LADLE)!]
    )
  } else {
    witch = Witch__factory.connect(protocol.get(WITCH)!, deployerAcc)
    console.log(`Reusing witch at: ${witch.address}`)
  }
})()
