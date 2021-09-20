import { ethers } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, stringToBytes32 } from '../shared/helpers'

import { Cauldron } from '../typechain/Cauldron'
import { Ladle } from '../typechain/Ladle'
import { Witch } from '../typechain/Witch'
import { PoolFactory } from '../typechain/PoolFactory'
import { JoinFactory } from '../typechain/JoinFactory'
import { FYTokenFactory } from '../typechain/FYTokenFactory'
import { Wand } from '../typechain/Wand'

import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'


/**
 * @dev This script points the Wand to a new FYTokenFactory
 *
 * It takes as inputs the governance and protocol json address files.
 * The Wand gets access to permissioned functions in the FYTokenFactory.
 * A plan is recorded in the Cloak to isolate the Wand from the Cauldron, Ladle, Witch and Factories.
 */

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, ownerAcc)) as Wand

    // Since the new FYTokenFactory should be deployed and its address stored in protocol.json, we read it from there.
    const fyTokenFactory = await ethers.getContractAt('FYTokenFactory', protocol.get('fyTokenFactory') as string, ownerAcc) as unknown as FYTokenFactory

    const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as unknown as Cauldron
    const ladle = await ethers.getContractAt('Ladle', protocol.get('ladle') as string, ownerAcc) as unknown as Ladle
    const witch = await ethers.getContractAt('Witch', protocol.get('witch') as string, ownerAcc) as unknown as Witch
    const joinFactory = await ethers.getContractAt('JoinFactory', protocol.get('joinFactory') as string, ownerAcc) as unknown as JoinFactory
    const poolFactory = await ethers.getContractAt('PoolFactory', protocol.get('poolFactory') as string, ownerAcc) as unknown as PoolFactory
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake

    const proposal : Array<{ target: string; data: string}> = []

    proposal.push({
        target: wand.address,
        data: wand.interface.encodeFunctionData('point', [
            stringToBytes32('fyTokenFactory'),
            fyTokenFactory.address,
        ])
    })
    console.log(`wand.point(fyTokenFactory, ${fyTokenFactory.address})`)

    proposal.push({
        target: fyTokenFactory.address,
        data: fyTokenFactory.interface.encodeFunctionData('grantRoles', [
            [
                id(fyTokenFactory.interface, 'createFYToken(bytes6,address,address,uint32,string,string)')
            ],
            wand.address
        ])
    })
    console.log(`fyTokenFactory.grantRoles(wand)`)
        
    const plan = [
        {
            contact: cauldron.address, signatures: [
                id(cauldron.interface, 'addAsset(bytes6,address)'),
                id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'),
                id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
                id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
                id(cauldron.interface, 'setLendingOracle(bytes6,address)'),
                id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
            ]
        },
        {
            contact: ladle.address, signatures: [
                id(ladle.interface, 'addJoin(bytes6,address)'),
                id(ladle.interface, 'addPool(bytes6,address)'),
            ]
        },
        {
            contact: joinFactory.address, signatures: [
                id(joinFactory.interface, 'createJoin(address)'),
            ]
        },
        {
            contact: fyTokenFactory.address, signatures: [
                id(fyTokenFactory.interface, 'createFYToken(bytes6,address,address,uint32,string,string)')
            ]
        },
        {
            contact: poolFactory.address, signatures: [
                id(poolFactory.interface, 'createPool(address,address)'),
            ]
        },
    ]

    proposal.push({
        target: cloak.address,
        data: cloak.interface.encodeFunctionData('plan', [wand.address, plan])
    })
    console.log(`cloak.plan(wand): ${await cloak.hash(wand.address, plan)}`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    { await timelock.propose(proposal); console.log(`Proposed ${txHash}`) }
    { await timelock.approve(txHash); console.log(`Approved ${txHash}`) }
    { await timelock.execute(proposal); console.log(`Executed ${txHash}`) }

})()