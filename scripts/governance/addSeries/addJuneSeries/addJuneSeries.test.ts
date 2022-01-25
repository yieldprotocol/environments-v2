import { ethers } from 'hardhat'

import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { readAddressMappingIfExists, bytesToBytes32, impersonate, getOriginalChainId, getOwnerOrImpersonate } from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, CompositeMultiOracle, WstETHMock } from '../../../../typechain'
import { developer, whale, newSeries, assets } from './addEthSeries.config'
import { WSTETH, STETH, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests ENS as a collateral
 */

;(async () => {
  const chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developer.get(chainId) as string)
  let whaleAcc: SignerWithAddress

  const protocol = readAddressMappingIfExists('protocol.json');

  const wstEth = (await ethers.getContractAt(
    'WstETHMock',
    (assets.get(chainId) as Map<string, string>).get(WSTETH) as string,
    ownerAcc
  )) as unknown as WstETHMock
  const stEth = (await ethers.getContractAt(
    'ERC20Mock',
    (assets.get(chainId) as Map<string, string>).get(STETH) as string,
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

  whaleAcc = await impersonate(whale.get(chainId) as string, WAD)
  await stEth.connect(whaleAcc).approve(wstEth.address, WAD.mul(10))
  await wstEth.connect(whaleAcc).wrap(WAD.mul(10))

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
    const borrowed = BigNumber.from(10).pow(await fyToken.decimals()).mul(dust).div(1000000) // `debt` is defined with 12 decimals for Ether
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(WSTETH), borrowed))[0].mul(ratio).div(1000000).mul(101).div(100) // borrowed * spot * ratio * 1.01 (for margin)
    const wstEthBalanceBefore = await wstEth.balanceOf(whaleAcc.address)

    // Build vault
    await ladle.build(seriesId, WSTETH, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post wstEth and borrow fyETH
    const wstEthJoinAddress = await ladle.joins(WSTETH)
    console.log(`posting ${posted} wstETH out of ${await wstEth.balanceOf(whaleAcc.address)}`)
    await wstEth.connect(whaleAcc).transfer(wstEthJoinAddress, posted)
    console.log(`borrowing ${borrowed} fyETH`)
    await ladle.pour(vaultId, whaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw "art mismatch"
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw "ink mismatch"
    
    // Repay fyEth and withdraw wstEth
    await fyToken.connect(whaleAcc).transfer(fyToken.address, borrowed)
    console.log(`repaying ${borrowed} fyETH and withdrawing ${posted} wstETH`)
    await ladle.pour(vaultId, whaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await wstEth.balanceOf(whaleAcc.address)).toString() !== wstEthBalanceBefore.toString()) throw "balance mismatch"
  }
})()
