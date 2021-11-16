import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, getOwnerOrImpersonate } from '../../../../shared/helpers'

import { Ladle, ERC20Mock, LidoWrapHandler } from '../../../../typechain'

import { WSTETH, STETH, WAD, MAX256 } from '../../../../shared/constants'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

/**
 * @dev This script tests the stEth, wstEth and LidoWrapHandler integration with the Ladle 
 */

describe('LidoWrapHandler', function () {
  let wstEth: ERC20Mock
  let stEth: ERC20Mock
  let ladle: Ladle
  let lidoWrapHandler: LidoWrapHandler
  let ownerAcc: SignerWithAddress

  before(async () => {
    const developerIfImpersonating = '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'
    ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating)
  
    const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
    const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>

    wstEth = (await ethers.getContractAt(
      'ERC20Mock',
      assets.get(WSTETH) as string,
      ownerAcc
    )) as unknown as ERC20Mock
    await wstEth.mint(ownerAcc.address, WAD)

    stEth = (await ethers.getContractAt(
      'ERC20Mock',
      assets.get(STETH) as string,
      ownerAcc
    )) as unknown as ERC20Mock
    await stEth.mint(ownerAcc.address, WAD)

    ladle = (await ethers.getContractAt(
      'Ladle',
      protocol.get('ladle') as string,
      ownerAcc
    )) as unknown as Ladle

    lidoWrapHandler = (await ethers.getContractAt(
      'LidoWrapHandler',
      protocol.get('lidoWrapHandler') as string,
      ownerAcc
    )) as unknown as LidoWrapHandler
  })

  it('test', async () => {
    // transfers wstEth through the Ladle
    await wstEth.approve(ladle.address, MAX256)
    await ladle.transfer(wstEth.address, lidoWrapHandler.address, WAD)

    // transfers stEth through the Ladle
    await stEth.approve(ladle.address, MAX256)
    await ladle.transfer(stEth.address, lidoWrapHandler.address, WAD)

    // routes calls through the Ladle
    const wrapCall = lidoWrapHandler.interface.encodeFunctionData('wrap', [ownerAcc.address])
    await ladle.route(lidoWrapHandler.address, wrapCall)
  })
})
