import { ethers } from 'hardhat'

import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { jsonToMap, stringToBytes6, bytesToBytes32, impersonate, getOriginalChainId } from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, CompositeMultiOracle } from '../../../../typechain'

import { YVUSDC, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests YVUSDC as a collateral
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (!(chainId === 1 || chainId === 4 || chainId === 42)) throw "Only Kovan, Rinkeby and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const seriesIds: Array<string> = [
    stringToBytes6('0104'),
    stringToBytes6('0105'),
    stringToBytes6('0204'),
    stringToBytes6('0205'),
  ]  

  // Impersonate YVUSDC whale 0xd7a029db2585553978190db5e85ec724aa4df23f
  const yvUSDCWhale = '0xd7a029db2585553978190db5e85ec724aa4df23f'
  const yvUSDCWhaleAcc = await impersonate(yvUSDCWhale, WAD)

  const yvUSDCAddress = new Map([
    [1, '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
    [42, '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  ]) // https://yvUSDC.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU
  
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>

  const yvUSDC = (await ethers.getContractAt(
    'ERC20Mock',
    yvUSDCAddress.get(chainId) as string,
    yvUSDCWhaleAcc
  )) as unknown as ERC20Mock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    yvUSDCWhaleAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    yvUSDCWhaleAcc
  )) as unknown as Ladle
  const oracle = (await ethers.getContractAt(
    'CompositeMultiOracle',
    protocol.get('compositeOracle') as string,
    yvUSDCWhaleAcc
  )) as unknown as CompositeMultiOracle

  if (chainId !== 1) { // Use the mock YVUSDC to mint
    await yvUSDC.mint(yvUSDCWhale, WAD.mul(1000000)) // This should be enough
  }
  const yvUSDCBalanceBefore = await yvUSDC.balanceOf(yvUSDCWhaleAcc.address)
  console.log(`${yvUSDCBalanceBefore} YVUSDC available`)

  for (let seriesId of seriesIds) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      series.fyToken,
      yvUSDCWhaleAcc
      )) as unknown as FYToken
    
    const dust = (await cauldron.debt(series.baseId, YVUSDC)).min
    const ratio = (await cauldron.spotOracles(series.baseId, YVUSDC)).ratio
    const borrowed = BigNumber.from(10).pow(await fyToken.decimals()).mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(YVUSDC), borrowed))[0].mul(ratio).div(1000000).mul(101).div(100) // borrowed * spot * ratio * 1.01 (for margin)

    // Build vault
    await ladle.build(seriesId, YVUSDC, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post YVUSDC and borrow fyDAI
    const linkJoinAddress = await ladle.joins(YVUSDC)
    await yvUSDC.transfer(linkJoinAddress, posted)
    await ladle.pour(vaultId, yvUSDCWhaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw "art mismatch"
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw "ink mismatch"
    
    // Repay fyDai and withdraw yvUSDC
    await fyToken.transfer(fyToken.address, borrowed)
    await ladle.pour(vaultId, yvUSDCWhaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await yvUSDC.balanceOf(yvUSDCWhaleAcc.address)).toString() !== yvUSDCBalanceBefore.toString()) throw "balance mismatch"
  }
})()
