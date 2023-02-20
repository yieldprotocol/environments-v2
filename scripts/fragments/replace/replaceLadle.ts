import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { jsonToMap, getName, id } from '../../../shared/helpers'

import { Ladle } from '../../../typechain/Ladle'
import { Wand } from '../../../typechain/Wand'
import { Timelock } from '../../../typechain/Timelock'
import { EmergencyBrake } from '../../../typechain/EmergencyBrake'
import { Join } from '../../../typechain/Join'
import { FYToken } from '../../../typechain/FYToken'
import { Strategy } from '../../../typechain/Strategy'
;(async () => {
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
  });
  const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ownerAcc] = await ethers.getSigners()
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync('./addresses/joins.json', 'utf8')) as Map<string, string>
  const fyTokens = jsonToMap(fs.readFileSync('./addresses/fyTokens.json', 'utf8')) as Map<string, string>
  const pools = jsonToMap(fs.readFileSync('./addresses/pools.json', 'utf8')) as Map<string, string>
  const strategies = jsonToMap(fs.readFileSync('./addresses/strategies.json', 'utf8')) as Map<string, string>

  const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as unknown as Wand
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock
  const cloak = (await ethers.getContractAt(
    'EmergencyBrake',
    governance.get('cloak') as string,
    ownerAcc
  )) as unknown as EmergencyBrake
  const ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as unknown as Ladle

  let proposal: Array<{ target: string; data: string }> = []
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRoles', [
      [id(ladle.interface, 'addJoin(bytes6,address)'), id(ladle.interface, 'addPool(bytes6,address)')],
      wand.address,
    ]),
  })
  console.log(indent(nesting, `ladle.grantRoles(wand)`))

  proposal.push({
    target: wand.address,
    data: wand.interface.encodeFunctionData('point', [ethers.utils.formatBytes32String('ladle'), ladle.address]),
  })
  console.log(indent(nesting, `Wand reorchestration`))

  for (let assetId of joins.keys()) {
    const joinAddress = joins.get(assetId) as string
    const join = (await ethers.getContractAt('Join', joinAddress, ownerAcc)) as unknown as Join

    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addJoin', [assetId, joins.get(assetId) as string]),
    })

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
        ladle.address,
      ]),
    })
    console.log(`Join ${assetId} permissions`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)'), id(join.interface, 'exit(address,uint128)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
    })
    console.log(`cloak.plan(ladle, join(${getName(assetId)})): ${await cloak.hash(ladle.address, plan)}`)
  }

  for (let seriesId of fyTokens.keys()) {
    const fyToken = (await ethers.getContractAt(
      'FYToken',
      fyTokens.get(seriesId) as string,
      ownerAcc
    )) as unknown as FYToken

    proposal.push({
      target: fyToken.address,
      data: fyToken.interface.encodeFunctionData('grantRoles', [
        [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
        ladle.address,
      ]),
    })
    console.log(`FYToken ${seriesId} permissions`)

    const plan = [
      {
        contact: fyToken.address,
        signatures: [id(fyToken.interface, 'mint(address,uint256)'), id(fyToken.interface, 'burn(address,uint256)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
    })
    console.log(`cloak.plan(ladle, fyToken(${getName(seriesId)})): ${await cloak.hash(ladle.address, plan)}`)
  }

  for (let seriesId of pools.keys()) {
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addPool', [seriesId, pools.get(seriesId) as string]),
    })
  }

  for (let symbol of strategies.keys()) {
    const strategy = (await ethers.getContractAt(
      'Strategy',
      strategies.get(symbol) as string,
      ownerAcc
    )) as unknown as Strategy

    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addIntegration', [strategy.address, true]),
    })
    proposal.push({
      target: ladle.address,
      data: ladle.interface.encodeFunctionData('addToken', [strategy.address, true]),
    })
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(indent(nesting, `Proposal: ${txHash}`))
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    console.log(indent(nesting, `Proposed ${txHash}`))
  }
  while ((await timelock.proposals(txHash)).state < 1) {}
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    console.log(indent(nesting, `Approved ${txHash}`))
  }
  while ((await timelock.proposals(txHash)).state < 2) {}
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    console.log(indent(nesting, `Executed ${txHash}`))
  }
})()
