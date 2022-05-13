import { ethers } from 'hardhat'
import { writeAddressMap, getOwnerOrImpersonate } from '../../../../../shared/helpers'

import { deployWrapEtherModule } from '../../../../fragments/modules/deployWrapEtherModule'

import { Cauldron, WETH9Mock } from '../../../../../typechain'
import { ETH } from '../../../../../shared/constants'
const { developer, assets } = require(process.env.CONF as string)
const { protocol } = require(process.env.CONF as string)

/**
 * @dev This script deploys the WrapEtherModule Oracle
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer as string)

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron

  const weth = (await ethers.getContractAt('WETH9Mock', assets.get(ETH) as string, ownerAcc)) as unknown as WETH9Mock

  const wrapEtherModule = await deployWrapEtherModule(ownerAcc, cauldron, weth, protocol)
  protocol.set('wrapEtherModule', wrapEtherModule.address)

  writeAddressMap('protocol.json', protocol)
})()
