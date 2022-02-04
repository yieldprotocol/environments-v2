import { ethers } from 'hardhat'
import { readAddressMappingIfExists, writeAddressMap, getOwnerOrImpersonate, getOriginalChainId } from '../../../shared/helpers'

import { deployUniswapOracle } from '../../fragments/oracles/deployUniswapOracle'

import { Timelock } from '../../../typechain'
const { developer } = require(process.env.CONF as string)

/**
 * @dev This script deploys the Uniswap Oracle
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

  const uniswapOracle = await deployUniswapOracle(ownerAcc, timelock, protocol)
  protocol.set('uniswapOracle', uniswapOracle.address)

  writeAddressMap('protocol.json', protocol);
})()
