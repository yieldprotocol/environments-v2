import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, getOwnerOrImpersonate, getOriginalChainId, impersonate } from '../../../../shared/helpers'

import { Ladle, ERC20Mock, WstETHMock, LidoWrapHandler } from '../../../../typechain'

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
  let stEthWhaleAcc: SignerWithAddress

  before(async () => {
    const chainId = await getOriginalChainId()
    if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
    const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'
  
    const developer = new Map([
      [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
      [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    ])
  
    let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)
  
    const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
    const assets = jsonToMap(fs.readFileSync(path + 'assets.json', 'utf8')) as Map<string, string>

    wstEth = (await ethers.getContractAt(
      'WstETHMock',
      assets.get(WSTETH) as string,
      ownerAcc
    )) as unknown as WstETHMock

    stEth = (await ethers.getContractAt(
      'ERC20Mock',
      assets.get(STETH) as string,
      ownerAcc
    )) as unknown as ERC20Mock

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

    if (chainId === 1) {
      // Impersonate stETH whale 0x35e3564c86bc0b5548a3be3a9a1e71eb1455fad2
      const stEthWhale = '0x35e3564c86bc0b5548a3be3a9a1e71eb1455fad2'
      stEthWhaleAcc = await impersonate(stEthWhale, WAD)
      await stEth.connect(stEthWhaleAcc).approve(wstEth.address, WAD)
      await wstEth.connect(stEthWhaleAcc).wrap(WAD)
    } else {
      stEthWhaleAcc = ownerAcc
      await wstEth.mint(stEthWhaleAcc.address, WAD)
      await stEth.mint(stEthWhaleAcc.address, WAD)
    }
  })

  it('routes calls through the Ladle', async () => {
    // Make sure there is something in the wrapper
    await stEth.connect(stEthWhaleAcc).transfer(lidoWrapHandler.address, WAD)

    const wrapCall = lidoWrapHandler.interface.encodeFunctionData('wrap', [stEthWhaleAcc.address])
    await ladle.connect(stEthWhaleAcc).route(lidoWrapHandler.address, wrapCall)
  })

  it('transfers wstEth through the Ladle', async () => {
    await wstEth.connect(stEthWhaleAcc).approve(ladle.address, MAX256)
    await ladle.connect(stEthWhaleAcc).transfer(wstEth.address, lidoWrapHandler.address, WAD)
  })

  it('transfers stEth through the Ladle', async () => {
    await stEth.connect(stEthWhaleAcc).approve(ladle.address, MAX256)
    await ladle.connect(stEthWhaleAcc).transfer(stEth.address, lidoWrapHandler.address, WAD)
  })
})
