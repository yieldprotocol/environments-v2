import { ethers, waffle } from 'hardhat'

import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { jsonToMap, bytesToBytes32, impersonate, getOwnerOrImpersonate, getOriginalChainId} from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, ChainlinkMultiOracle } from '../../../../typechain'
import { developerIfImpersonating, assetAddress, uniWhale, seriesIlks } from './addUNICollateral.config'
import { UNI, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests UNI as a collateral
 */
;(async () => {
  let chainId: number
  chainId = await getOriginalChainId()

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)
  const path = chainId == 1 ? './addresses/mainnet/' : './addresses/kovan/'
  const protocol = jsonToMap(fs.readFileSync(path + 'protocol.json', 'utf8')) as Map<string, string>

  const uni = ((await ethers.getContractAt(
    'ERC20Mock',
    assetAddress.get(chainId) as string,
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

  // Impersonating uniWhale
  let uniWhaleAcc: SignerWithAddress
  uniWhaleAcc = await impersonate(uniWhale.get(chainId) as string, WAD)

  const uniBalanceBefore = await uni.balanceOf(uniWhaleAcc.address)
  console.log(`${uniBalanceBefore} UNI available`)

  for (let seriesId of seriesIlks) {
    console.log(`series: ${seriesId[0]}`)
    const series = await cauldron.series(seriesId[0])
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
    await ladle.connect(uniWhaleAcc).build(seriesId[0], UNI, 0)
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
    if ((await uni.balanceOf(uniWhaleAcc.address)).toString() !== uniBalanceBefore.toString()) throw 'balance mismatch'
  }
})()
