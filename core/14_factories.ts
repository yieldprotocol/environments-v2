import { ethers, waffle } from 'hardhat'
import *  as hre from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import JoinFactoryArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/JoinFactory.sol/JoinFactory.json'

import { PoolFactory } from '../typechain/PoolFactory'
import { JoinFactory } from '../typechain/JoinFactory'
import { FYTokenFactory } from '../typechain/FYTokenFactory'

import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

const { deployContract } = waffle;

/**
 * @dev This script deploys the Factories
 *
 * It takes as inputs the governance and protocol json address files.
 * The protocol json address file is updated.
 * The Timelock and Cloak get ROOT access. Root access is removed from the deployer.
 * The Timelock gets access to governance functions.
 */

(async () => {
/*    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: ["0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5"],
    });
    const ownerAcc = await ethers.getSigner("0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5") */
    const [ ownerAcc ] = await ethers.getSigners();
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const ROOT = await timelock.ROOT()

    let joinFactory: JoinFactory
    if (protocol.get('joinFactory') === undefined) {
        joinFactory = (await deployContract(ownerAcc, JoinFactoryArtifact, [])) as JoinFactory
        console.log(`[JoinFactory, '${joinFactory.address}'],`)
        verify(joinFactory.address, [])
        protocol.set('joinFactory', joinFactory.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        joinFactory = (await ethers.getContractAt('JoinFactory', protocol.get('joinFactory') as string, ownerAcc)) as JoinFactory
    }
    
    if (!(await joinFactory.hasRole(ROOT, timelock.address))) {
        await joinFactory.grantRole(ROOT, timelock.address); console.log(`joinFactory.grantRoles(ROOT, timelock)`)
        while (!(await joinFactory.hasRole(ROOT, timelock.address))) { }
    }

    let fyTokenFactory: FYTokenFactory
    if (protocol.get('fyTokenFactory') ===  undefined) {
        const fyTokenFactoryFactory = await ethers.getContractFactory('FYTokenFactory', {
        libraries: {
            SafeERC20Namer: protocol.get('safeERC20Namer') as string
        },
        })
        fyTokenFactory = ((await fyTokenFactoryFactory.deploy()) as unknown) as FYTokenFactory
        await fyTokenFactory.deployed()
        console.log(`[FYTokenFactory, '${fyTokenFactory.address}'],`)
        verify(fyTokenFactory.address, [], 'safeERC20Namer.js')
        protocol.set('fyTokenFactory', fyTokenFactory.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        fyTokenFactory = (await ethers.getContractAt('FYTokenFactory', protocol.get('fyTokenFactory') as string, ownerAcc)) as FYTokenFactory
    }

    if (!(await fyTokenFactory.hasRole(ROOT, timelock.address))) {
        await fyTokenFactory.grantRole(ROOT, timelock.address); console.log(`fyTokenFactory.grantRoles(ROOT, timelock)`)
        while (!(await fyTokenFactory.hasRole(ROOT, timelock.address))) { }
    }

    let poolFactory: PoolFactory
    if (protocol.get('poolFactory') === undefined) {
        const poolLibs = {
            YieldMath: protocol.get('yieldMath') as string,
            SafeERC20Namer: protocol.get('safeERC20Namer') as string
        }
        const PoolFactoryFactory = await ethers.getContractFactory('PoolFactory', {
            libraries: poolLibs,
        })
        poolFactory = ((await PoolFactoryFactory.deploy()) as unknown) as PoolFactory
        await poolFactory.deployed()
        console.log(`[PoolFactory, '${poolFactory.address}'],`)
        verify(poolFactory.address, [], 'safeERC20Namer.js')
        protocol.set('poolFactory', poolFactory.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        poolFactory = (await ethers.getContractAt('PoolFactory', protocol.get('poolFactory') as string, ownerAcc)) as PoolFactory
    }
    if (!(await poolFactory.hasRole(ROOT, timelock.address))) {
        await poolFactory.grantRole(ROOT, timelock.address); console.log(`poolFactory.grantRoles(ROOT, timelock)`)
        while (!(await poolFactory.hasRole(ROOT, timelock.address))) { }
    }

    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, revoke ROOT from the deployer
    const proposal : Array<{ target: string; data: string}> = []
    proposal.push({
        target: joinFactory.address,
        data: joinFactory.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`joinFactory.grantRole(ROOT, cloak)`)

    proposal.push({
        target: joinFactory.address,
        data: joinFactory.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`joinFactory.revokeRole(ROOT, deployer)`)

    proposal.push({
        target: fyTokenFactory.address,
        data: fyTokenFactory.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`fyTokenFactory.grantRole(ROOT, cloak)`)

    proposal.push({
        target: fyTokenFactory.address,
        data: fyTokenFactory.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`fyTokenFactory.revokeRole(ROOT, deployer)`)

    proposal.push({
        target: poolFactory.address,
        data: poolFactory.interface.encodeFunctionData('grantRoles', [
            [
                id(poolFactory.interface, 'setParameter(bytes32,int128)'),
            ],
            timelock.address
        ])
    })
    console.log(`poolFactory.grantRoles(gov, timelock)`)

    proposal.push({
        target: poolFactory.address,
        data: poolFactory.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`poolFactory.grantRole(ROOT, cloak)`)

    proposal.push({
        target: poolFactory.address,
        data: poolFactory.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`poolFactory.revokeRole(ROOT, deployer)`)

    // Propose, approve, execute
    const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
    if ((await timelock.proposals(txHash)).state === 0) { await timelock.propose(proposal); console.log(`Proposed ${txHash}`) }
    while ((await timelock.proposals(txHash)).state < 1) { }
    if ((await timelock.proposals(txHash)).state === 1) { await timelock.approve(txHash); console.log(`Approved ${txHash}`) }
    while ((await timelock.proposals(txHash)).state < 2) { }
    if ((await timelock.proposals(txHash)).state === 2) { await timelock.execute(proposal); console.log(`Executed ${txHash}`) }
})()