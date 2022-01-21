import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { deployChainlinkL2USDOracle } from '../../../fragments/oracles/deployChainlinkL2USDOracle'
import { CHAINLINKUSD } from '../../../../shared/constants'
import { Timelock } from '../../../../typechain'
import { developer } from './newEnvironment.arb_rinkeby.config'

/**
 * @dev This script deploys the Ladle
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer as string)
  const protocol = readAddressMappingIfExists('protocol.json');
  const governance = readAddressMappingIfExists('governance.json');

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  // We are deploying an L2 oracle, but we treat it as the original L1 throughout the code
  const chainlinkUSDOracle = await deployChainlinkL2USDOracle(ownerAcc, timelock, protocol)
  protocol.set(CHAINLINKUSD, chainlinkUSDOracle.address)


  writeAddressMap('protocol.json', protocol);
})()
