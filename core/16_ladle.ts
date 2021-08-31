import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'
import { ETH } from '../shared/constants'

import LadleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Ladle.sol/Ladle.json'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

const { deployContract } = waffle;

/**
 * This script deploys the SafeERC20Namer and YieldMath libraries
 */

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const assets = jsonToMap(fs.readFileSync('./output/assets.json', 'utf8')) as Map<string,string>;
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const weth9 = assets.get(ETH) as string
    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
    const ROOT = await timelock.ROOT()

    const ladle = (await deployContract(ownerAcc, LadleArtifact, [cauldron.address, weth9])) as Ladle
    console.log(`[Ladle, '${ladle.address}'],`)
    verify(ladle.address, [cauldron.address, weth9])
    protocol.set('ladle', ladle.address)
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    await ladle.grantRole(ROOT, timelock.address); console.log(`ladle.grantRoles(ROOT, timelock)`)

    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, revoke ROOT from the deployer
    // Orchestrate Ladle to use the permissioned functions in Cauldron
    // Store a plan for isolating Cauldron from Ladle
    const proposal : Array<{ target: string; data: string}> = []
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
            timelock.address
        ])
    })
    console.log(`ladle.grantRoles(gov, timelock)`)

    proposal.push({
        target: ladle.address,
        data: ladle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`ladle.grantRole(ROOT, cloak)`)

    proposal.push({
        target: ladle.address,
        data: ladle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
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
            ladle.address
        ])
    })
    console.log(`cauldron.grantRoles(ladle)`)

    proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [ladle.address,
            [
                {
                    contact: cauldron.address, signatures: [
                        id(cauldron.interface, 'build(address,bytes12,bytes6,bytes6)'),
                        id(cauldron.interface, 'destroy(bytes12)'),
                        id(cauldron.interface, 'tweak(bytes12,bytes6,bytes6)'),
                        id(cauldron.interface, 'give(bytes12,address)'),
                        id(cauldron.interface, 'pour(bytes12,int128,int128)'),
                        id(cauldron.interface, 'stir(bytes12,bytes12,uint128,uint128)'),
                        id(cauldron.interface, 'roll(bytes12,bytes6,int128)'),
                    ]
                }
            ]
        ])
    })
    console.log(`cloak.plan(ladle)`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)

})()