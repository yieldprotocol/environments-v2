import { ethers } from 'hardhat'
import {
  writeAddressMap,
  getOwnerOrImpersonate,
} from '../../../shared/helpers'

import { deployChainlinkL2USDOracle } from '../../fragments/oracles/deployChainlinkL2USDOracle'
import { CHAINLINKUSD } from '../../../shared/constants'
import { Timelock } from '../../../typechain'
const { developer, protocol, governance, sequencerFlags } = require(process.env.CONF as string)

/**
 * @dev This script deploys the ChainlinkL2USDMultiOracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // We are deploying an L2 oracle, but we treat it as the original L1 throughout the code
  const chainlinkUSDOracle = await deployChainlinkL2USDOracle(ownerAcc, timelock, protocol, sequencerFlags)
  protocol.set(CHAINLINKUSD, chainlinkUSDOracle.address)
  writeAddressMap('protocol.json', protocol)
})()
