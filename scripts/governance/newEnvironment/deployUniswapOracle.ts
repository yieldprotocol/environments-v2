import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../shared/helpers'

import { deployUniswapOracle } from '../../fragments/oracles/deployUniswapOracle'
import { Timelock } from '../../../typechain'
const { protocol, governance } = require(process.env.CONF as string)
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Uniswap Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const uniswapOracle = await deployUniswapOracle(ownerAcc, timelock, protocol)
  protocol.set('uniswapOracle', uniswapOracle.address)

  writeAddressMap('protocol.json', protocol)
})()
