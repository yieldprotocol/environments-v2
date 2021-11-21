import { ethers, waffle } from 'hardhat'

import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  jsonToMap,
  stringToBytes6,
  bytesToBytes32,
  impersonate,
  getOwnerOrImpersonate,
  getOriginalChainId,
} from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, ChainlinkMultiOracle } from '../../../../typechain'

import { UNI, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests UNI as a collateral
 */
;(async () => {
  const seriesIds: Array<string> = [
    stringToBytes6('0104'),
    stringToBytes6('0105'),
    stringToBytes6('0204'),
    stringToBytes6('0205'),
  ]

  const developerIfImpersonating = new Map([
    [1, '0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42, '0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  ])

  const uniAddress = new Map([
    [1, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
    [42, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'],
  ]) // https://docs.chain.link/docs/link-token-contracts/

  let chainId: number
  chainId = await getOriginalChainId()
  
  if (chainId==42) throw 'Unrecognized chain'

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)
  const protocol = jsonToMap(fs.readFileSync('./addresses/mainnet/protocol.json', 'utf8')) as Map<string, string>

  const uni = ((await ethers.getContractAt(
    'ERC20Mock',
    uniAddress.get(chainId) as string,
    ownerAcc
  )) as unknown) as ERC20Mock
  const cauldron = ((await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown) as Cauldron
  const ladle = ((await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown) as Ladle
  const oracle = ((await ethers.getContractAt(
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )) as unknown) as ChainlinkMultiOracle

  let uniWhaleAcc: SignerWithAddress
  if (chainId === 1) {
    // Impersonate UNI whale 0x47173b170c64d16393a52e6c480b3ad8c302ba1e
    const uniWhale = '0x47173b170c64d16393a52e6c480b3ad8c302ba1e'
    uniWhaleAcc = await impersonate(uniWhale, WAD)
  } else {
    await uni.mint(ownerAcc.address, WAD.mul(1000000)) // This should be enough
    uniWhaleAcc = ownerAcc
  }

  const uniBalanceBefore = await uni.balanceOf(uniWhaleAcc.address)
  console.log(`${uniBalanceBefore} UNI available`)

  for (let seriesId of seriesIds) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = ((await ethers.getContractAt('FYToken', series.fyToken, ownerAcc)) as unknown) as FYToken

    const dust = (await cauldron.debt(series.baseId, UNI)).min
    const ratio = (await cauldron.spotOracles(series.baseId, UNI)).ratio
    const borrowed = BigNumber.from(10)
      .pow(await fyToken.decimals())
      .mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(UNI), borrowed))[0]
      .mul(ratio)
      .div(1000000)
      .mul(101)
      .div(100) // borrowed * spot * ratio * 1.01 (for margin)

    // Build vault
    await ladle.connect(uniWhaleAcc).build(seriesId, UNI, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post UNI and borrow fyDAI
    const uniJoinAddress = await ladle.joins(UNI)
    await uni.connect(uniWhaleAcc).transfer(uniJoinAddress, posted)
    await ladle.connect(uniWhaleAcc).pour(vaultId, uniWhaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyDai and withdraw uni
    await fyToken.connect(uniWhaleAcc).transfer(fyToken.address, borrowed)
    await ladle.connect(uniWhaleAcc).pour(vaultId, uniWhaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await uni.balanceOf(uniWhaleAcc.address)).toString() !== uniBalanceBefore.toString())
      throw 'balance mismatch'
  }
})()
