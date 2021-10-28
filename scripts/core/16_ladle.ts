import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify } from '../../shared/helpers'
import { ETH } from '../../shared/constants'

import LadleArtifact from '../../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'

import { Cauldron } from '../../typechain/Cauldron'
import { Ladle } from '../../typechain/Ladle'
import { Timelock } from '../../typechain/Timelock'
import { EmergencyBrake } from '../../typechain/EmergencyBrake'
import { ERC20Mock } from '../../typechain/ERC20Mock'

const { deployContract } = waffle

/**
 * @dev This script deploys the Ladle
 *
 * It takes as inputs the assets (for WETH), governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 * The Ladle gets access to permissioned functions in the Cauldron.
 * A plan is recorded in the Cloak to isolate the Ladle from the Cauldron.
 */

;(async () => {
  /* await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708"],
  });
  const ownerAcc = await ethers.getSigner("0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708") */
  const [ownerAcc] = await ethers.getSigners()

  const assets = jsonToMap(fs.readFileSync('./addresses/assets.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  const weth9 = (await ethers.getContractAt('ERC20Mock', assets.get(ETH) as string, ownerAcc)) as unknown as ERC20Mock
  console.log(`Using ${await weth9.name()} at ${assets.get(ETH)}`)

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
  const ROOT = await timelock.ROOT()

  let ladle: Ladle
  if (protocol.get('ladle') === undefined) {
    ladle = (await deployContract(ownerAcc, LadleArtifact, [cauldron.address, weth9.address])) as Ladle
    console.log(`[Ladle, '${ladle.address}'],`)
    verify(ladle.address, [cauldron.address, weth9.address])
    protocol.set('ladle', ladle.address)
    fs.writeFileSync('./addresses/protocol.json', mapToJson(protocol), 'utf8')
  } else {
    ladle = (await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc)) as Ladle
  }
  if (!(await ladle.hasRole(ROOT, timelock.address))) {
    await ladle.grantRole(ROOT, timelock.address)
    console.log(`ladle.grantRoles(ROOT, timelock)`)
    while (!(await ladle.hasRole(ROOT, timelock.address))) {}
  }

  const router = await ladle.router()
  console.log(`[Router, '${router}'],`)
  verify(router, [])
  protocol.set('router', router)
  fs.writeFileSync('./addresses/protocol.json', mapToJson(protocol), 'utf8')

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  // Orchestrate Ladle to use the permissioned functions in Cauldron
  // Store a plan for isolating Cauldron from Ladle
  const proposal: Array<{ target: string; data: string }> = []
  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRoles', [
      [
        id(ladle.interface, 'addJoin(bytes6,address)'),
        id(ladle.interface, 'addPool(bytes6,address)'),
        id(ladle.interface, 'addToken(address,bool)'),
        id(ladle.interface, 'addIntegration(address,bool)'),
        id(ladle.interface, 'addModule(address,bool)'),
        id(ladle.interface, 'setFee(uint256)'),
      ],
      timelock.address,
    ]),
  })
  console.log(`ladle.grantRoles(gov, timelock)`)

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`ladle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: ladle.address,
    data: ladle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address]),
  })
  console.log(`ladle.revokeRole(ROOT, deployer)`)

  proposal.push({
    target: cauldron.address,
    data: cauldron.interface.encodeFunctionData('grantRoles', [
      [
        id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'destroy(bytes12)'),
        id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'give(bytes12,address)'),
        id(cauldron.interface, 'pour(bytes12,int128,int128)'),
        id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
        id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
      ],
      ladle.address,
    ]),
  })
  console.log(`cauldron.grantRoles(ladle)`)

  const plan = [
    {
      contact: cauldron.address,
      signatures: [
        id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'destroy(bytes12)'),
        id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
        id(cauldron.interface, 'give(bytes12,address)'),
        id(cauldron.interface, 'pour(bytes12,int128,int128)'),
        id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
        id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
      ],
    },
  ]

  proposal.push({
    target: cloak.address,
    data: cloak.interface.encodeFunctionData('plan', [ladle.address, plan]),
  })
  console.log(`cloak.plan(ladle): ${await cloak.hash(ladle.address, plan)}`)

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
