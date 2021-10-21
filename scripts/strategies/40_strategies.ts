import { ethers, waffle } from 'hardhat'
import * as fs from 'fs'
import * as hre from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, mapToJson, verify } from '../../shared/helpers'
import { WAD, ETH, DAI, USDC, WBTC, USDT } from '../../shared/constants'

import { Ladle } from '../../typechain/Ladle'
import { Strategy } from '../../typechain/Strategy'
import { ERC20Mock } from '../../typechain/ERC20Mock'
import { Timelock } from '../../typechain/Timelock'

const { deployContract } = waffle

const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
const strategies = jsonToMap(fs.readFileSync('./addresses/strategies.json', 'utf8')) as Map<string, string>
const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

/**
 * @dev This script deploys strategies specified in config.ts
 */

;(async () => {
  // Series to deploy. A FYToken and Pool will be deployed for each one. The underlying assets must exist and have been added as bases. The collaterals accepted must exist and have been added as collateral for the fyToken underlying asset.
  const strategiesData: Array<[string, string, string]> = [
    // name, symbol, baseId
    ['YSDAI6MMS', 'YSDAI6MMS', DAI],
    ['YSDAI6MJD', 'YSDAI6MJD', DAI],
    ['YSUSDC6MMS', 'YSUSDC6MMS', USDC],
    ['YSUSDC6MJD', 'YSUSDC6MJD', USDC],
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

  const strategies = jsonToMap(fs.readFileSync('./addresses/strategies.json', 'utf8')) as Map<string, string>

  for (let [name, symbol, baseId] of strategiesData) {
    const base = (await ethers.getContractAt(
      'ERC20Mock',
      assets.get(baseId) as string as string,
      ownerAcc
    )) as unknown as ERC20Mock
    console.log(`Using ${await base.name()} at ${base.address} as base`)

    const strategy = (await strategyFactory.deploy(name, symbol, ladle.address, base.address, baseId)) as Strategy
    console.log(`[Strategy, '${strategy.address}'],`)
    verify(strategy.address, [name, symbol, ladle.address, base.address, baseId], 'safeERC20Namer.js')
    strategies.set(symbol, strategy.address)
    fs.writeFileSync('./addresses/strategies.json', mapToJson(strategies), 'utf8')
    await strategy.grantRole(ROOT, timelock.address)
    console.log(`strategy.grantRoles(ROOT, timelock)`)
    while (!(await strategy.hasRole(ROOT, timelock.address))) {}

    // Build the proposal
    const proposal: Array<{ target: string; data: string }> = []

    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('grantRoles', [
        [
          ROOT,
          id(strategy.interface, 'setRewardsToken(address)'),
          id(strategy.interface, 'setRewards(uint32,uint32,uint96)'),
          id(strategy.interface, 'setYield(address)'),
          id(strategy.interface, 'setTokenId(bytes6)'),
          id(strategy.interface, 'resetTokenJoin()'),
          id(strategy.interface, 'setNextPool(address,bytes6)'),
          id(strategy.interface, 'startPool(uint256,uint256)'),
        ],
        timelock.address,
      ]),
    })
    console.log(`strategy(${symbol}).grantRoles(gov, timelock)`)
    proposal.push({
      target: strategy.address,
      data: strategy.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address]),
    })
    console.log(`strategy(${symbol}).revokeRole(ROOT, deployer)`)

    // Propose, approve, execute
    const txHash = await timelock.hash(proposal)
    console.log(`Proposal: ${txHash}`)
    if ((await timelock.proposals(txHash)).state === 0) {
      await timelock.propose(proposal)
      console.log(`Proposed ${txHash}`)
      while ((await timelock.proposals(txHash)).state < 1) {}
    }
    if ((await timelock.proposals(txHash)).state === 1) {
      await timelock.approve(txHash)
      console.log(`Approved ${txHash}`)
      while ((await timelock.proposals(txHash)).state < 2) {}
    }
    if ((await timelock.proposals(txHash)).state === 2) {
      await timelock.execute(proposal)
      console.log(`Executed ${txHash}`)
      while ((await timelock.proposals(txHash)).state > 0) {}
    }
    while ((await timelock.proposals(txHash)).state === 2) {}
  }
})()
