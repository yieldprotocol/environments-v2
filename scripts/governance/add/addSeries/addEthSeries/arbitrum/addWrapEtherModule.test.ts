import { ethers } from 'hardhat'

import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  readAddressMappingIfExists,
  bytesToBytes32,
  impersonate,
  getOriginalChainId,
  getOwnerOrImpersonate,
} from '../../../../../../shared/helpers'
import {
  ERC20,
  Cauldron,
  Ladle,
  FYToken,
  CompositeMultiOracle,
  AccumulatorMultiOracle,
  ChainlinkUSDMultiOracle,
  WrapEtherModule,
} from '../../../../../../typechain'
import { ETH, WAD } from '../../../../../../shared/constants'
const { developer, assets } = require(process.env.CONF as string)

/**
 * @dev This script tests WrapETHModule as a collateral
 */
;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  const protocol = readAddressMappingIfExists('protocol.json')

  const weth = (await ethers.getContractAt('ERC20', assets.get(ETH) as string, ownerAcc)) as unknown as ERC20
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  const wrapEtherModule = (await ethers.getContractAt(
    'WrapEtherModule',
    protocol.get('wrapEtherModule') as string,
    ownerAcc
  )) as unknown as WrapEtherModule

  const calldata = wrapEtherModule.interface.encodeFunctionData('wrap', [ownerAcc.address, WAD.div(10)])
  await ladle.moduleCall(wrapEtherModule.address, calldata, { value: WAD.div(10) })

  if ((await weth.balanceOf(ownerAcc.address)) != WAD.div(10)) throw new Error('Not wrapped')
})()
