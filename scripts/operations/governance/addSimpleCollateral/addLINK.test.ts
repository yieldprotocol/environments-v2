import { ethers, waffle } from 'hardhat'

import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { jsonToMap, stringToBytes6, bytesToBytes32, impersonate, getOwnerOrImpersonate } from '../../../../shared/helpers'
import { ERC20Mock, Cauldron, Ladle, FYToken, ChainlinkMultiOracle } from '../../../../typechain'

import { LINK, WAD } from '../../../../shared/constants'

/**
 * @dev This script tests LINK as a collateral
 */

;(async () => {
  const seriesIds: Array<string> = [
    stringToBytes6('0104'),
    stringToBytes6('0105'),
    stringToBytes6('0204'),
    stringToBytes6('0205'),
  ]  

  const developerIfImpersonating = new Map([
    [1,'0xC7aE076086623ecEA2450e364C838916a043F9a8'],
    [42,'0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5']
  ])

  const linkAddress = new Map([
    [1, '0x514910771af9ca656af840dff83e8264ecf986ca'],
    [42, '0xe37c6209C44d89c452A422DDF3B71D1538D58b96'],
  ]) // https://docs.chain.link/docs/link-token-contracts/

  let chainId: number

  // Because in forks the network name gets replaced by 'localhost' and chainId by 31337, we rely on checking known contracts to find out which chain are we on.
  if ((await ethers.provider.getCode(linkAddress.get(1) as string)) !== '0x') chainId = 1
  else if ((await ethers.provider.getCode(linkAddress.get(42) as string)) !== '0x') chainId = 42
  else throw "Unrecognized chain"

  let ownerAcc = await getOwnerOrImpersonate(developerIfImpersonating.get(chainId) as string)
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  const link = (await ethers.getContractAt(
    'ERC20Mock',
    linkAddress.get(chainId) as string,
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
    'ChainlinkMultiOracle',
    protocol.get('chainlinkOracle') as string,
    ownerAcc
  )) as unknown as ChainlinkMultiOracle

  let linkWhaleAcc: SignerWithAddress
  if (chainId === 1) {
    // Impersonate LINK whale 0x0d4f1ff895d12c34994d6b65fabbeefdc1a9fb39
    const linkWhale = '0x0d4f1ff895d12c34994d6b65fabbeefdc1a9fb39'
    linkWhaleAcc = await impersonate(linkWhale, WAD)
  } else {
    await link.mint(ownerAcc.address, WAD.mul(1000000)) // This should be enough
    linkWhaleAcc = ownerAcc
  }

  const linkBalanceBefore = await link.balanceOf(linkWhaleAcc.address)
  console.log(`${linkBalanceBefore} LINK available`)

  for (let seriesId of seriesIds) {
    console.log(`series: ${seriesId}`)
    const series = await cauldron.series(seriesId)
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      series.fyToken,
      ownerAcc
      )) as unknown as FYToken
    
    const dust = (await cauldron.debt(series.baseId, LINK)).min
    const ratio = (await cauldron.spotOracles(series.baseId, LINK)).ratio
    const borrowed = BigNumber.from(10).pow(await fyToken.decimals()).mul(dust)
    const posted = (await oracle.peek(bytesToBytes32(series.baseId), bytesToBytes32(LINK), borrowed))[0].mul(ratio).div(1000000).mul(11).div(10) // borrowed * spot * ratio * 1.1 (for margin)

    // Build vault
    await ladle.connect(linkWhaleAcc).build(seriesId, LINK, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post LINK and borrow fyDAI
    const linkJoinAddress = await ladle.joins(LINK)
    await link.connect(linkWhaleAcc).transfer(linkJoinAddress, posted)
    await ladle.connect(linkWhaleAcc).pour(vaultId, linkWhaleAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw "art mismatch"
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw "ink mismatch"
    
    // Repay fyDai and withdraw link
    await fyToken.connect(linkWhaleAcc).transfer(fyToken.address, borrowed)
    await ladle.connect(linkWhaleAcc).pour(vaultId, linkWhaleAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await link.balanceOf(linkWhaleAcc.address)).toString() !== linkBalanceBefore.toString()) throw "balance mismatch"
  }
})()
