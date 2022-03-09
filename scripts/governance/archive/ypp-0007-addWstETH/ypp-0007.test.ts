import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { BigNumber } from 'ethers'
import { jsonToMap, stringToBytes6, getOwnerOrImpersonate } from '../../../shared/helpers'

import { ERC20Mock, Cauldron, Ladle, FYToken } from '../../../typechain'

import { WSTETH, WAD } from '../../../shared/constants'

/**
 * @dev This script executes the part of ypp-0007 that can be condensed in a single Timelock proposal.
 * Previously, the CompositeMultiOracle and the LidoOracle should have been deployed, and ROOT access
 * given to the Timelock. WstETH should also have been added as an asset to the Cauldron.
 * Deploy the Composite Oracle
 * Deploy the Lido oracle
 * Add WstETH as an asset
 * --- You are here ---
 * Configure the permissions for the Lido Oracle
 * Add WstETH as the source for the Lido Oracle
 * Add the stETH/ETH source to the Chainlink Oracle
 * Configure the permissions for the Composite Oracle
 * Add the underlying sources for the Composite Oracle
 * Add the DAI/WSTETH and USDC/WSTETH paths in the Composite Oracle
 * Permission the WstETHJoin
 * Make WstETH into an Ilk
 * Approve WstEth as collateral for all series
 */
;(async () => {
  const wstEthAddress: string = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0' // https://docs.lido.fi/deployed-contracts
  const seriesIds: Array<string> = [
    stringToBytes6('0104'),
    stringToBytes6('0105'),
    stringToBytes6('0204'),
    stringToBytes6('0205'),
  ]

  // Impersonate wstETH whale 0xdaef20ea4708fcff06204a4fe9ddf41db056ba18
  const impersonatedAddress = '0xdaef20ea4708fcff06204a4fe9ddf41db056ba18'
  const ownerAcc = await getOwnerOrImpersonate(impersonatedAddress)

  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const wstEth = (await ethers.getContractAt('ERC20Mock', wstEthAddress, ownerAcc)) as unknown as ERC20Mock
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle

  const wstEthBalanceBefore = await wstEth.balanceOf(ownerAcc.address)
  console.log(`${wstEthBalanceBefore} wstETH available`)

  for (let seriesId of seriesIds) {
    console.log(`series: ${seriesId}`)
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      (
        await cauldron.series(seriesId)
      ).fyToken,
      ownerAcc
    )) as unknown as FYToken

    const borrowed = BigNumber.from(10).pow(await fyToken.decimals())
    const posted = WAD

    // Build vault
    await ladle.build(seriesId, WSTETH, 0)
    const logs = await cauldron.queryFilter(cauldron.filters.VaultBuilt(null, null, null, null))
    const vaultId = logs[logs.length - 1].args.vaultId
    console.log(`vault: ${vaultId}`)

    // Post wstETH and borrow fyDAI
    const wstEthJoinAddress = await ladle.joins(WSTETH)
    await wstEth.transfer(wstEthJoinAddress, posted)
    await ladle.pour(vaultId, ownerAcc.address, posted, borrowed)
    console.log(`posted and borrowed`)

    if ((await cauldron.balances(vaultId)).art.toString() !== borrowed.toString()) throw 'art mismatch'
    if ((await cauldron.balances(vaultId)).ink.toString() !== posted.toString()) throw 'ink mismatch'

    // Repay fyDai and withdraw wstEth
    await fyToken.transfer(fyToken.address, borrowed)
    await ladle.pour(vaultId, ownerAcc.address, posted.mul(-1), borrowed.mul(-1))
    console.log(`repaid and withdrawn`)
    if ((await wstEth.balanceOf(ownerAcc.address)).toString() !== wstEthBalanceBefore.toString())
      throw 'balance mismatch'
  }
})()
