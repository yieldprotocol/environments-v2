/**
 * @dev This script creates a number of vaults, assuming the ilk is an ERC20Mock and allows unrestricted minting.
 *
 * It takes as inputs the assets and protocol address files.
 */

import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../../shared/constants'
import { jsonToMap, stringToBytes6 } from '../../shared/helpers'
import { BigNumber } from 'ethers'

import { ERC20Mock } from '../../typechain/ERC20Mock'
import { Cauldron } from '../../typechain/Cauldron'
import { Ladle } from '../../typechain/Ladle'

;(async () => {
  const oneUSDC = WAD.div(10 ** 12)
  const newVaults: Array<[string, string, BigNumber, BigNumber]> = new Array([
    // seriesId, ilkId, ink, art
    stringToBytes6('0103'),
    DAI,
    WAD.mul(2).div(3),
    WAD.mul(2).div(3),
  ])

  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ownerAcc] = await ethers.getSigners()

  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle

  const filter = cauldron.filters.VaultBuilt(null, null, null, null)
  for (let [seriesId, ilkId, ink, art] of newVaults) {
    const join = (await ladle.joins(ilkId)) as string
    const ilk = (await ethers.getContractAt('ERC20Mock', assets.get(ilkId) as string, ownerAcc)) as unknown as ERC20Mock

    console.log(`Approving ${ladle.address} to take ${ink.toString()} ${await ilk.symbol()}`)
    if ((await ilk.allowance(ownerAcc.address, ladle.address)).toString() !== ink.toString()) {
      await ilk.approve(ladle.address, ink)
      while ((await ilk.allowance(ownerAcc.address, ladle.address)).toString() !== ink.toString()) {}
    }
    console.log(`Approved`)

    console.log(`Creating vault for ${seriesId} and ${ilkId}...`)
    console.log(`... and borrowing ${art} with ${ink}`)
    await ladle.batch([
      ladle.interface.encodeFunctionData('build', [seriesId, ilkId, 0]),
      ladle.interface.encodeFunctionData('transfer', [ilk.address, ladle.address, ink]),
      ladle.interface.encodeFunctionData('pour', ['0x' + '00'.repeat(12), ownerAcc.address, ink, art]),
    ])
    console.log(`Done`)
    // TODO: Pick the right event
    // const events = await cauldron.queryFilter(filter)
    // console.log(`Vault built: ${events[events.length - 1].args}`)
  }
})()
