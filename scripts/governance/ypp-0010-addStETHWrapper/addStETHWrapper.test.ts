import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import * as fs from 'fs'
import { jsonToMap, getOwnerOrImpersonate, getOriginalChainId, impersonate } from '../../../shared/helpers'
import { Ladle, ERC20Mock, LidoWrapHandler } from '../../../typechain'
import { WSTETH, STETH, WAD, MAX256 } from '../../../shared/constants'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'

function almostEqual(x: BigNumber, y: BigNumber, p: BigNumber) {
  // Check that abs(x - y) < p:
  const diff = x.gt(y) ? BigNumber.from(x).sub(y) : BigNumber.from(y).sub(x) // Not sure why I have to convert x and y to BigNumber
  expect(diff.div(p)).to.eq(0) // Hack to avoid silly conversions. BigNumber truncates decimals off.
}

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
  let otherAcc: SignerWithAddress

  before(async () => {
    const chainId = await getOriginalChainId()
    const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

    const developer = new Map([
      [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
      [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
    ])

    ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)
    otherAcc = (await ethers.getSigners())[1]

    const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
    const assets = jsonToMap(fs.readFileSync(path + 'assets.json', 'utf8')) as Map<string, string>

    wstEth = await ethers.getContractAt('WstETHMock', assets.get(WSTETH) as string, ownerAcc)

    stEth = await ethers.getContractAt('ERC20Mock', assets.get(STETH) as string, ownerAcc)

    ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)

    lidoWrapHandler = await ethers.getContractAt('LidoWrapHandler', protocol.get('lidoWrapHandler') as string, ownerAcc)

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
    const toWrap = await stEth.balanceOf(lidoWrapHandler.address)
    const toObtain = await wstEth.getWstETHByStETH(toWrap)

    const balanceBefore = await wstEth.balanceOf(otherAcc.address)
    const wrapCall = lidoWrapHandler.interface.encodeFunctionData('wrap', [otherAcc.address])
    await ladle.connect(stEthWhaleAcc).route(lidoWrapHandler.address, wrapCall)
    expect(await wstEth.balanceOf(otherAcc.address)).to.equal(balanceBefore.add(toObtain))
  })

  it('transfers wstEth through the Ladle', async () => {
    const transferred = WAD
    const balanceBefore = await wstEth.balanceOf(otherAcc.address)
    await wstEth.connect(stEthWhaleAcc).approve(ladle.address, MAX256)
    await ladle.connect(stEthWhaleAcc).transfer(wstEth.address, otherAcc.address, transferred)
    expect(await wstEth.balanceOf(otherAcc.address)).to.equal(balanceBefore.add(transferred))
  })

  it('transfers stEth through the Ladle', async () => {
    const transferred = WAD
    const balanceBefore = await stEth.balanceOf(otherAcc.address)
    await stEth.connect(stEthWhaleAcc).approve(ladle.address, MAX256)
    await ladle.connect(stEthWhaleAcc).transfer(stEth.address, otherAcc.address, transferred)
    almostEqual(await stEth.balanceOf(otherAcc.address), balanceBefore.add(transferred), WAD)
  })
})
