import { ethers } from 'hardhat'

import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { jsonToMap, bytesToBytes32, impersonate, getOriginalChainId, getOwnerOrImpersonate } from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, CompositeMultiOracle, WstETHMock } from '../../../../typechain'
import { newSeries } from './addEthSeries.config'
import { WSTETH, STETH, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests ENS as a collateral
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const developer = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string, WAD)
  let stEthWhaleAcc: SignerWithAddress

  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>
  const assets = jsonToMap(fs.readFileSync(path + 'assets.json', 'utf8')) as Map<string, string>
  const stethAddress = '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'
  const wstethAddress = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'

  const wstEth = (await ethers.getContractAt(
    'WstETHMock',
    wstethAddress,
    ownerAcc
  )) as unknown as WstETHMock
  const stEth = (await ethers.getContractAt(
    'ERC20Mock',
    stethAddress,
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

  // Impersonate stETH whale 0x35e3564c86bc0b5548a3be3a9a1e71eb1455fad2
  const stEthWhale = '0x35e3564c86bc0b5548a3be3a9a1e71eb1455fad2'
  stEthWhaleAcc = await impersonate(stEthWhale, WAD.mul(100))
  await stEth.connect(stEthWhaleAcc).approve(wstEth.address, WAD.mul(50))
  await wstEth.connect(stEthWhaleAcc).wrap(WAD.mul(50))

  const seriesId = newSeries[1][0] //FYETH2206
  console.log(`series: ${seriesId}`)
  const series = await cauldron.series(seriesId)
  const fyToken = (await ethers.getContractAt(
    'FYToken',
    series.fyToken,
    ownerAcc
    )) as unknown as FYToken

  const dust = (await cauldron.debt(series.baseId, WSTETH)).min
  console.log('dust', dust.toString())
  const ratio = (await cauldron.spotOracles(series.baseId, WSTETH)).ratio
  console.log('ratio', ratio.toString())
  const borrowed = BigNumber.from(10).pow(await fyToken.decimals()).mul(dust)
  console.log('borrowed.toString()', borrowed.toString())

  const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(WSTETH), borrowed))[0].mul(ratio).div(1000000).mul(101).div(100) // borrowed * spot * ratio * 1.01 (for margin)
  console.log('posted.toString()  ', posted.toString())
  const wstEthBalanceBefore = await wstEth.balanceOf(stEthWhaleAcc.address)

  console.log('stuff')
  console.log((await cauldron.debt(series.baseId, WSTETH)).max.toString())
  console.log((await cauldron.debt(series.baseId, WSTETH)).dec.toString())
  console.log('borrowed            ', borrowed.toString())
  console.log('wstEthBalanceBefore', wstEthBalanceBefore.toString())

  // Build vault
  await ladle.build(seriesId, WSTETH, 0)
  const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
  const vaultId = logs[logs.length - 1].args.vaultId
  console.log(`vault: ${vaultId}`)

  // Post wstEth and borrow fyETH
  const wstEthJoinAddress = await ladle.joins(WSTETH)

  await wstEth.connect(stEthWhaleAcc).approve(wstEthJoinAddress, borrowed)
  await wstEth.connect(stEthWhaleAcc).transfer(wstEthJoinAddress, borrowed)
  await ladle.pour(vaultId, stEthWhaleAcc.address, posted, borrowed)
  console.log(`posted and borrowed  - vaultId:${vaultId}`)

  if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw "art mismatch"
  if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw "ink mismatch"

})()
