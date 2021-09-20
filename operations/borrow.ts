/**
 * @dev This script creates a number of vaults, assuming the ilk is an ERC20Mock and allows unrestricted minting.
 * 
 * It takes as inputs the assets and protocol address files.
 */

import { ethers } from 'hardhat'
import *  as hre from 'hardhat'
import *  as fs from 'fs'
import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../shared/constants'
import { jsonToMap, stringToBytes6 } from '../shared/helpers'

import { ERC20Mock } from '../typechain/ERC20Mock'
import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'

(async () => {
  const oneUSDC = WAD.div(10**12)
  const newVaults: Array<[string, string, string, string]> = new Array([ // seriesId, ilkId, ink, art
    stringToBytes6('0220'),
    DAI,
    WAD.mul(8000).toString(),
    oneUSDC.mul(3000).toString() // In USDC units
  ])
  
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ ownerAcc ] = await ethers.getSigners();

  const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;

  // Contract instantiation
  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
  const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle

  const filter = cauldron.filters.VaultBuilt(null, null, null, null)
  for (let [seriesId, ilkId, ink, art] of newVaults) {
    const join = await ladle.joins(ilkId)
    const ilk = await ethers.getContractAt('ERC20Mock', assets.get(ilkId) as string, ownerAcc) as unknown as ERC20Mock
    await ilk.mint(join, ink)
    await ladle.batch([
      ladle.interface.encodeFunctionData('build', [seriesId, ilkId, 0]),
      ladle.interface.encodeFunctionData('pour', ['0x'+'00'.repeat(12), ownerAcc.address, ink, art])
    ])
    // TODO: Pick the right event
    // const events = await cauldron.queryFilter(filter)
    // console.log(`Vault built: ${events[events.length - 1].args}`)
  }
})()