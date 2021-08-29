import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { ETH } from '../shared/constants'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap } from '../shared/helpers'
import { verify } from '../shared/helpers'

import LadleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Wand } from '../typechain/Wand'
import { Timelock } from '../typechain/Timelock'
import { Join } from '../typechain/Join'
import { FYToken } from '../typechain/FYToken'

const { deployContract } = waffle

async function cauldronLadleAuth(cauldron: Cauldron, receiver: string) {
  await cauldron.grantRoles(
    [
      id('build(address,bytes12,bytes6,bytes6)'),
      id('destroy(bytes12)'),
      id('tweak(bytes12,bytes6,bytes6)'),
      id('give(bytes12,address)'),
      id('pour(bytes12,int128,int128)'),
      id('stir(bytes12,bytes12,uint128,uint128)'),
      id('roll(bytes12,bytes6,int128)'),
    ],
    receiver
  )
}

async function ladleGovAuth(ladle: Ladle, receiver: string) {
  await ladle.grantRoles(
    [
      id('addJoin(bytes6,address)'),
      id('addPool(bytes6,address)'),
      id('setModule(address,bool)'),
      id('setFee(uint256)'),
    ],
    receiver
  )
}

(async () => {
  const [ owner ] = await ethers.getSigners();
  const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string,string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
  const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;
  const joins = jsonToMap(fs.readFileSync('./output/joins.json', 'utf8')) as Map<string,string>;
  const fyTokens = jsonToMap(fs.readFileSync('./output/fyTokens.json', 'utf8')) as Map<string,string>;
  const pools = jsonToMap(fs.readFileSync('./output/pools.json', 'utf8')) as Map<string,string>;

  const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, owner) as unknown as Cauldron
  const wand = await ethers.getContractAt('Wand', protocol.get('wand') as string, owner) as unknown as Wand
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, owner) as unknown as Timelock
  const weth9 = assets.get(ETH) as string

  const ladle = (await deployContract(owner, LadleArtifact, [cauldron.address, weth9])) as Ladle
  console.log(`[Ladle, '${ladle.address}'],`)
  verify(ladle.address, [cauldron.address, weth9])

  await cauldronLadleAuth(cauldron, ladle.address); console.log(`Cauldron permissions`)
  await ladleGovAuth(ladle, wand.address); console.log(`Wand permissions`)
  await ladleGovAuth(ladle, timelock.address); console.log(`Timelock permissions`)
  await wand.point(ethers.utils.formatBytes32String('ladle'), ladle.address); console.log(`Wand reorchestration`)

  const JOIN = id('join(address,uint128)')
  const EXIT = id('exit(address,uint128)')
  const MINT = id('mint(address,uint256)')
  const BURN = id('burn(address,uint256)')

  for (let assetId of joins.keys()) {
    const joinAddress = joins.get(assetId) as string
    const join = await ethers.getContractAt('Join', joinAddress, owner) as unknown as Join

    await join.grantRoles(
      [
        id(join.interface, 'join(address,uint128)'),
        id(join.interface, 'exit(address,uint128)')
      ],
      ladle.address
    ); console.log(`Join ${assetId} permissions`)
    await ladle.addJoin(assetId, joinAddress); console.log(`Join added to Ladle`)
  }

  for (let seriesId of fyTokens.keys()) {
    const fyToken = await ethers.getContractAt('FYToken', fyTokens.get(seriesId) as string, owner) as unknown as FYToken
    await fyToken.grantRoles(
      [
        id(fyToken.interface, 'mint(address,uint256)'),
        id(fyToken.interface, 'burn(address,uint256)')
      ],
      ladle.address
    ); console.log(`FYToken ${seriesId} permissions`)
  }

  for (let seriesId of pools.keys()) {
    await ladle.addPool(seriesId, pools.get(seriesId) as string); console.log(`Pool ${seriesId} added to Ladle`)
  }
})()
