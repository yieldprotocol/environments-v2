// TODO: REFACTOR FOR FYTOKEN

import { ethers } from 'hardhat'

import { BigNumber } from 'ethers'
import { readAddressMappingIfExists, stringToBytes6, bytesToBytes32, impersonate } from '../../../../../shared/helpers'
import { ERC1155Mock, Cauldron, Ladle, FYToken, IOracle } from '../../../../../typechain'

import { FDAI2206, FUSDC2206, FDAI2206ID, FUSDC2206ID, WAD, NOTIONAL } from '../../../../../shared/constants'

const protocol = readAddressMappingIfExists('protocol.json')
const fCashAddress = '0x1344A36A1B56144C3Bc62E7757377D288fDE0369'

/**
 * @dev This script tests FYTokens as a collateral
 */
;(async () => {
  const seriesIlksIds: Array<[string, string, string]> = [
    [stringToBytes6('0106'), FDAI2206, FDAI2206ID.toString()],
    [stringToBytes6('0206'), FUSDC2206, FUSDC2206ID.toString()],
  ]

  const fCashWhale = '0x741AA7CFB2c7bF2A1E7D4dA2e3Df6a56cA4131F3'
  const fCashWhaleAcc = await impersonate(fCashWhale, WAD)

  const fCash = (await ethers.getContractAt('ERC1155Mock', fCashAddress, fCashWhaleAcc)) as unknown as ERC1155Mock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    fCashWhaleAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt(
    'Ladle',
    protocol.get('ladle') as string,
    fCashWhaleAcc
  )) as unknown as Ladle
  const oracle = (await ethers.getContractAt(
    'IOracle',
    protocol.get(NOTIONAL) as string,
    fCashWhaleAcc
  )) as unknown as IOracle

  for (let [seriesId, ilkId, fCashId] of seriesIlksIds) {
    const fCashBalanceBefore = await fCash.balanceOf(fCashWhaleAcc.address, fCashId)
    console.log(`${fCashBalanceBefore} FCASH${fCashId} available`)
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt('FYToken', series.fyToken, fCashWhaleAcc)) as unknown as FYToken

    const dust = (await cauldron.debt(series.baseId, ilkId)).min
    const ratio = (await cauldron.spotOracles(series.baseId, ilkId)).ratio
    const borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(ilkId), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)

    // Build vault
    await ladle.build(seriesId, ilkId, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post FCASH and borrow fyDAI
    const linkJoinAddress = await ladle.joins(ilkId)
    await fCash.safeTransferFrom(fCashWhaleAcc.address, linkJoinAddress, fCashId, posted, '0x00')
    await ladle.pour(vaultId, fCashWhaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyDai and withdraw fCash
    await fyToken.transfer(fyToken.address, borrowed)
    await ladle.pour(vaultId, fCashWhaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await fCash.balanceOf(fCashWhaleAcc.address, fCashId)).toString() !== fCashBalanceBefore.toString())
      throw 'balance mismatch'
  }
})()
