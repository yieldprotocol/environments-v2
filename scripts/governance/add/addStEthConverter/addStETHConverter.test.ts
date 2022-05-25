import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'
import * as fs from 'fs'
import { jsonToMap, getOwnerOrImpersonate, getOriginalChainId, impersonate } from '../../../../shared/helpers'

import { Ladle, ERC20Mock, WstETHMock, StEthConverter } from '../../../../typechain'

import { WSTETH, STETH, WAD, MAX256 } from '../../../../shared/constants'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
const { developer, assets, protocol, whales } = require(process.env.CONF as string)

function almostEqual(x: BigNumber, y: BigNumber, p: BigNumber) {
  // Check that abs(x - y) < p:
  const diff = x.gt(y) ? BigNumber.from(x).sub(y) : BigNumber.from(y).sub(x) // Not sure why I have to convert x and y to BigNumber
  expect(diff.div(p)).to.eq(0) // Hack to avoid silly conversions. BigNumber truncates decimals off.
}

/**
 * @dev This script tests the stEth, wstEth and StEthConverter integration with the Ladle
 */

describe('StEthConverter', function () {
  let wstEth: WstETHMock
  let stEth: ERC20Mock
  let ladle: Ladle
  let stEthConverter: StEthConverter
  let ownerAcc: SignerWithAddress
  let stEthWhaleAcc: SignerWithAddress
  let otherAcc: SignerWithAddress

  before(async () => {
    const chainId = await getOriginalChainId()

    ownerAcc = await getOwnerOrImpersonate(developer, WAD)
    otherAcc = (await ethers.getSigners())[1]

    wstEth = (await ethers.getContractAt('WstETHMock', assets.get(WSTETH) as string, ownerAcc)) as unknown as WstETHMock

    stEth = (await ethers.getContractAt('ERC20Mock', assets.get(STETH) as string, ownerAcc)) as unknown as ERC20Mock

    ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle

    stEthConverter = (await ethers.getContractAt(
      'StEthConverter',
      protocol.get('stEthConverter') as string,
      ownerAcc
    )) as unknown as StEthConverter

    if (chainId === 1) {
      // Impersonate stETH whale 0x35e3564c86bc0b5548a3be3a9a1e71eb1455fad2
      const stEthWhale = whales.get(STETH) as string
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
    await stEth.connect(stEthWhaleAcc).transfer(stEthConverter.address, WAD)
    const toWrap = await stEth.balanceOf(stEthConverter.address)
    const toObtain = await wstEth.getWstETHByStETH(toWrap)

    const balanceBefore = await wstEth.balanceOf(otherAcc.address)
    const wrapCall = stEthConverter.interface.encodeFunctionData('wrap', [otherAcc.address])
    await ladle.connect(stEthWhaleAcc).route(stEthConverter.address, wrapCall)
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
