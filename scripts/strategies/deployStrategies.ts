import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, mapToJson, verify } from '../../shared/helpers'
import { DAI, USDC } from '../../shared/constants'

import { Ladle } from '../../typechain/Ladle'
import { Strategy } from '../../typechain/Strategy'
import { ERC20Mock } from '../../typechain/ERC20Mock'
import { Timelock } from '../../typechain/Timelock'

const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
const strategies = jsonToMap(fs.readFileSync('./addresses/strategies.json', 'utf8')) as Map<string, string>
const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

/**
 * @dev This script deploys strategies
 */

;(async () => {
  // Series to deploy. A FYToken and Pool will be deployed for each one. The underlying assets must exist and have been added as bases. The collaterals accepted must exist and have been added as collateral for the fyToken underlying asset.
  const strategiesData: Array<[string, string, string]> = [
    // name, symbol, baseId
    ['Yield Strategy DAI 6M Mar Sep',  'YSDAI6MMS',  DAI],
    ['Yield Strategy DAI 6M Jun Dec',  'YSDAI6MJD',  DAI],
    ['Yield Strategy USDC 6M Mar Sep', 'YSUSDC6MMS', USDC],
    ['Yield Strategy USDC 6M Jun Dec', 'YSUSDC6MJD', USDC],
  ]

  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()

  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle
  if ((await ethers.provider.getCode(ladle.address)) === '0x') throw `Address ${ladle.address} contains no code`

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  if ((await ethers.provider.getCode(timelock.address)) === '0x') throw `Address ${timelock.address} contains no code`

  const ROOT = await timelock.ROOT()

  const strategyFactory = await ethers.getContractFactory('Strategy', {
    libraries: {
      SafeERC20Namer: protocol.get('safeERC20Namer') as string,
      YieldMathExtensions: protocol.get('yieldMathExtensions') as string,
    },
  })

  for (let [name, symbol, baseId] of strategiesData) {
    const base = (await ethers.getContractAt(
      'ERC20Mock',
      assets.get(baseId) as string as string,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(`Using ${await base.name()} at ${base.address} as base`)

    let strategy: Strategy
    if (strategies.get('symbol') === undefined) {
      strategy = (await strategyFactory.deploy(name, symbol, ladle.address, base.address, baseId)) as Strategy
      console.log(`[Strategy, '${strategy.address}'],`)
      verify(strategy.address, [name, symbol, ladle.address, base.address, baseId], 'safeERC20Namer.js')
      strategies.set(symbol, strategy.address)
      fs.writeFileSync('./addresses/strategies.json', mapToJson(strategies), 'utf8')
    } else {
      strategy = (await ethers.getContractAt('Strategy', strategies.get('symbol') as string, ownerAcc)) as Strategy
    }
    if (!(await strategy.hasRole(ROOT, timelock.address))) {
      await strategy.grantRole(ROOT, timelock.address)
      console.log(`strategy.grantRoles(ROOT, timelock)`)
      while (!(await strategy.hasRole(ROOT, timelock.address))) {}
    }
  }
})()
