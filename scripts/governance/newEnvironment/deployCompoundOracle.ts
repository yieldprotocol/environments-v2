import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployCompoundOracle } from '../../fragments/oracles/deployCompoundOracle'

import { Timelock } from '../../../typechain'
import { developer } from './newEnvironment.rinkeby.config'

/**
 * @dev This script deploys the Compound Oracle
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

  const compoundOracle = await deployCompoundOracle(ownerAcc, timelock, protocol)
  protocol.set('compoundOracle', compoundOracle.address)

  writeAddressMap('protocol.json', protocol);
})()
