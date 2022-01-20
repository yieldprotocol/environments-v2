import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../../shared/helpers'

import { deployChainlinkUSDOracle } from '../../../fragments/oracles/deployChainlinkUSDOracle'

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

  const chainlinkUSDOracle = await deployChainlinkUSDOracle(ownerAcc, timelock, protocol)
  protocol.set('chainlinkUSDOracle', chainlinkUSDOracle.address)


  writeAddressMap('protocol.json', protocol);
})()
