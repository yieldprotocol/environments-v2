import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, stringToBytes32, bytesToString } from '../../../shared/helpers'
import { ETH, DAI, USDC, WBTC } from '../../../shared/constants'

import { Cauldron } from '../../../typechain/Cauldron'
import { Join } from '../../../typechain/Join'
import { Wand } from '../../../typechain/Wand'
import { Witch } from '../../../typechain/Witch'

import { Timelock } from '../../../typechain/Timelock'
import { EmergencyBrake } from '../../../typechain/EmergencyBrake'

/**
 * @dev This script points the Wand to a new Witch
 *
 * It takes as inputs the governance and protocol json address files.
 * A plan is recorded in the Cloak to isolate the Wand from the Cauldron, Ladle, Witch and Factories.
 */
;(async () => {
  const oldWitchAddress = '0x002BcA19F5B4be65CC2d3444e89cEbd036F081c3'
  const baseIds: Array<string> = [DAI, USDC]
  const ilkIds: Array<string> = [ETH, DAI, USDC, WBTC]

  /* await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
    });
    const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
  const [ownerAcc] = await ethers.getSigners()
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const joins = jsonToMap(fs.readFileSync('./addresses/joins.json', 'utf8')) as Map<string, string>

  const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as Wand

  // Since the new Witch should be deployed and its address stored in protocol.json, we read it from there.
  const witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc)) as unknown as Witch
  const oldWitch = (await ethers.getContractAt('Witch', oldWitchAddress, ownerAcc)) as unknown as Witch

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
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

  const proposal: Array<{ target: string; data: string }> = []

  // Revoke roles for the old witch
  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('revokeRoles', [
      [id(cauldron.interface, 'give(bytes12,address)'), id(cauldron.interface, 'slurp(bytes12,uint128,uint128)')],
      oldWitchAddress,
    ]),
  })
  console.log(`cauldron.revokeRoles(witch, slurp)`)

  // Point wand to the new witch
  proposal.push({
    target: wand.address,
    data: wand.interface.encodeFunctionData('point', [stringToBytes32('witch'), witch.address]),
  })
  console.log(`wand.point(witch, ${witch.address})`)

  // Add existing bases
  for (let baseId of baseIds) {
    const join = (await ethers.getContractAt('Join', joins.get(baseId) as string, ownerAcc)) as Join

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'join(address,uint128)')],
        witch.address,
      ]),
    })
    console.log(`Witch granted join access to join(${bytesToString(baseId)}`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('revokeRoles', [
        [id(join.interface, 'join(address,uint128)')],
        oldWitchAddress,
      ]),
    })
    console.log(`Old Witch revoked join access to join(${bytesToString(baseId)}`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'join(address,uint128)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [protocol.get('witch') as string, plan]),
    })
    console.log(
      `cloak.plan(witch, join(${bytesToString(baseId)})): ${await cloak.hash(protocol.get('witch') as string, plan)}`
    )
  }

  // Add existing ilks
  for (let ilkId of ilkIds) {
    const join = (await ethers.getContractAt('Join', joins.get(ilkId) as string, ownerAcc)) as Join
    const ilk = await oldWitch.ilks(ilkId)

    proposal.push({
      target: witch.address,
      data: witch.interface.encodeFunctionData('setIlk', [ilkId, ilk.duration, ilk.initialOffer, ilk.dust, ilk.active]),
    })
    console.log(`[Asset: ${bytesToString(ilkId)} set as ilk on witch at ${witch.address}],`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('grantRoles', [
        [id(join.interface, 'exit(address,uint128)')],
        witch.address,
      ]),
    })
    console.log(`Witch granted exit access to join(${bytesToString(ilkId)})`)

    proposal.push({
      target: join.address,
      data: join.interface.encodeFunctionData('revokeRoles', [
        [id(join.interface, 'exit(address,uint128)')],
        oldWitch.address,
      ]),
    })
    console.log(`Old Witch revoked exit access to join(${bytesToString(ilkId)})`)

    const plan = [
      {
        contact: join.address,
        signatures: [id(join.interface, 'exit(address,uint128)')],
      },
    ]

    proposal.push({
      target: cloak.address,
      data: cloak.interface.encodeFunctionData('plan', [protocol.get('witch') as string, plan]),
    })
    console.log(
      `cloak.plan(witch, join(${bytesToString(ilkId)})): ${await cloak.hash(protocol.get('witch') as string, plan)}`
    )
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    while ((await timelock.proposals(txHash)).state < 1) {}
    console.log(`Proposed ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    while ((await timelock.proposals(txHash)).state < 2) {}
    console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    while ((await timelock.proposals(txHash)).state > 0) {}
    console.log(`Executed ${txHash}`)
  }
})()
