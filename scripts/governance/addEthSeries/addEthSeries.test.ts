import { ethers } from 'hardhat'

import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { jsonToMap, bytesToBytes32, impersonate, getOriginalChainId, getOwnerOrImpersonate } from '../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, CompositeMultiOracle, WstETHMock } from '../../../typechain'
import { newSeries } from './addEthSeries.config'
import { WSTETH, STETH, WAD } from '../../../shared/constants'

/**
 * @dev This script tests ENS as a collateral
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [4, '0xf1a6ffa6513d0cC2a5f9185c4174eFDb51ba3b13'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)
  let stEthWhaleAcc: SignerWithAddress

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync(path + 'assets.json', 'utf8')) as Map<string, string>

  const wstEth = (await ethers.getContractAt(
    'WstETHMock',
    assets.get(WSTETH) as string,
    ownerAcc
  )) as unknown as WstETHMock
  const stEth = (await ethers.getContractAt(
    'ERC20Mock',
    assets.get(STETH) as string,
    ownerAcc
  )) as unknown as ERC20Mock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ownerAcc
  )) as unknown as Ladle
  const oracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    ownerAcc
  )) as unknown as CompositeMultiOracle

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

  for (let [seriesId] of newSeries) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      series.fyToken,
      ownerAcc
      )) as unknown as FYToken
    
    const dust = (await cauldron.debt(series.baseId, WSTETH)).min
    const ratio = (await cauldron.spotOracles(series.baseId, WSTETH)).ratio
    const borrowed = BigNumber.from(10).pow(await fyToken.decimals()).mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(WSTETH), borrowed))[0].mul(ratio).div(1000000).mul(101).div(100) // borrowed * spot * ratio * 1.01 (for margin)
    const wstEthBalanceBefore = await wstEth.balanceOf(stEthWhaleAcc.address)

    console.log((await cauldron.debt(series.baseId, WSTETH)).max.toString())
    console.log((await cauldron.debt(series.baseId, WSTETH)).dec.toString())
    console.log(borrowed.toString())

    // Build vault
    await ladle.build(seriesId, WSTETH, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post wstEth and borrow fyETH
    const wstEthJoinAddress = await ladle.joins(WSTETH)
    await wstEth.transfer(wstEthJoinAddress, posted)
    await ladle.pour(vaultId, stEthWhaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw "art mismatch"
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw "ink mismatch"
    
    // Repay fyEth and withdraw wstEth
    await fyToken.transfer(fyToken.address, borrowed)
    await ladle.pour(vaultId, stEthWhaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await wstEth.balanceOf(stEthWhaleAcc.address)).toString() !== wstEthBalanceBefore.toString()) throw "balance mismatch"
  }
})()
