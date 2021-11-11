import { ethers } from 'hardhat'

import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { jsonToMap, stringToBytes6, bytesToBytes32, impersonate, getOriginalChainId } from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, ChainlinkMultiOracle } from '../../../../typechain'

import { ENS, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests ENS as a collateral
 */

;(async () => {
  const chainId = await getOriginalChainId()
  if (chainId !== 1 && chainId !== 42) throw "Only Kovan and Mainnet supported"
  const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'

  const seriesIds: Array<string> = [
    stringToBytes6('0104'),
    stringToBytes6('0105'),
    stringToBytes6('0204'),
    stringToBytes6('0205'),
  ]  

  // Impersonate ENS whale 0xd7a029db2585553978190db5e85ec724aa4df23f
  const ensWhale = '0xd7a029db2585553978190db5e85ec724aa4df23f'
  const ensWhaleAcc = await impersonate(ensWhale, WAD)

  const ensAddress = new Map([
    [1, '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72'],
    [42, '0xA24b97c7617cc40dCc122F6dF813584A604a6C28'],
  ]) // https://ens.mirror.xyz/5cGl-Y37aTxtokdWk21qlULmE1aSM_NuX9fstbOPoWU
  
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>

  const ens = (await ethers.getContractAt(
    'ERC20Mock',
    ensAddress.get(chainId) as string,
    ensWhaleAcc
  )) as unknown as ERC20Mock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ensWhaleAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    ensWhaleAcc
  )) as unknown as Ladle
  const oracle = (await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ensWhaleAcc
  )) as unknown as ChainlinkMultiOracle

  if (chainId !== 1) { // Use the mock ENS to mint
    await ens.mint(ensWhale, WAD.mul(1000000)) // This should be enough
  }
  const ensBalanceBefore = await ens.balanceOf(ensWhaleAcc.address)
  console.log(`${ensBalanceBefore} ENS available`)

  for (let seriesId of seriesIds) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      series.fyToken,
      ensWhale
      )) as unknown as FYToken
    
    const dust = (await cauldron.debt(series.baseId, ENS)).min
    const ratio = (await cauldron.spotOracles(series.baseId, ENS)).ratio
    const borrowed = BigNumber.from(10).pow(await fyToken.decimals()).mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(ENS), borrowed))[0].mul(ratio).div(1000000).mul(101).div(100) // borrowed * spot * ratio * 1.01 (for margin)

    // Build vault
    await ladle.build(seriesId, ENS, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post ENS and borrow fyDAI
    const linkJoinAddress = await ladle.joins(ENS)
    await ens.transfer(linkJoinAddress, posted)
    await ladle.pour(vaultId, ensWhaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw "art mismatch"
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw "ink mismatch"
    
    // Repay fyDai and withdraw ens
    await fyToken.transfer(fyToken.address, borrowed)
    await ladle.pour(vaultId, ensWhaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await ens.balanceOf(ensWhaleAcc.address)).toString() !== ensBalanceBefore.toString()) throw "balance mismatch"
  }
})()
