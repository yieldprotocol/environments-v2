import { ethers, waffle } from 'hardhat'
import *  as hre from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import ChainlinkMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'
import CompoundMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CompoundMultiOracle.sol/CompoundMultiOracle.json'
import CompositeMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/composite/CompositeMultiOracle.sol/CompositeMultiOracle.json'
import CTokenMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CTokenMultiOracle.sol/CTokenMultiOracle.json'
import UniswapV3OracleArtifact from '../artifacts/uniswapv3-oracle/contracts/UniswapV3Oracle.sol/UniswapV3Oracle.json'

import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'
import { CTokenMultiOracle } from '../typechain/CTokenMultiOracle'
import { UniswapV3Oracle } from '../typechain/UniswapV3Oracle'

import { EmergencyBrake } from '../typechain/EmergencyBrake'
import { Timelock } from '../typechain/Timelock'

const { deployContract } = waffle;

/**
 * @dev This script deploys the MultiOracles
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

    let compoundOracle: CompoundMultiOracle
    if (protocol.get('compoundOracle') === undefined) {
        compoundOracle = (await deployContract(ownerAcc, CompoundMultiOracleArtifact, [])) as CompoundMultiOracle
        console.log(`[CompoundMultiOracle, '${compoundOracle.address}'],`)
        verify(compoundOracle.address, [])
        protocol.set('compoundOracle', compoundOracle.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        compoundOracle = (await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc)) as unknown as CompoundMultiOracle
    }
    if (!(await compoundOracle.hasRole(ROOT, timelock.address))) {
        await compoundOracle.grantRole(ROOT, timelock.address); console.log(`compoundOracle.grantRoles(ROOT, timelock)`)
        while (!(await compoundOracle.hasRole(ROOT, timelock.address))) { }
    }

    let chainlinkOracle: ChainlinkMultiOracle
    if (protocol.get('chainlinkOracle') === undefined) {
        chainlinkOracle = (await deployContract(ownerAcc, ChainlinkMultiOracleArtifact, [])) as ChainlinkMultiOracle
        console.log(`[ChainlinkMultiOracle, '${chainlinkOracle.address}'],`)
        verify(chainlinkOracle.address, [])
        protocol.set('chainlinkOracle', chainlinkOracle.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        chainlinkOracle = (await ethers.getContractAt('ChainlinkMultiOracle', protocol.get('chainlinkOracle') as string, ownerAcc)) as unknown as ChainlinkMultiOracle
    }
    if (!(await chainlinkOracle.hasRole(ROOT, timelock.address))) {
        await chainlinkOracle.grantRole(ROOT, timelock.address); console.log(`chainlinkOracle.grantRoles(ROOT, timelock)`)
        while (!(await compoundOracle.hasRole(ROOT, timelock.address))) { }
    }

    /* let compositeOracle: CompositeMultiOracle
    if (protocol.get('compositeOracle') === undefined) {
        compositeOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as CompositeMultiOracle
        console.log(`[CompositeMultiOracle, '${compositeOracle.address}'],`)
        verify(compositeOracle.address, [])
        protocol.set('compositeOracle', compositeOracle.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        compositeOracle = (await ethers.getContractAt('CompositeMultiOracle', protocol.get('compositeOracle') as string, ownerAcc)) as unknown as CompositeMultiOracle
    }
    if (!(await compositeOracle.hasRole(ROOT, timelock.address))) {
        await compositeOracle.grantRole(ROOT, timelock.address); console.log(`compositeOracle.grantRoles(ROOT, timelock)`)
        while (!(await compoundOracle.hasRole(ROOT, timelock.address))) { }
    }

    let cTokenOracle: CTokenMultiOracle
    if (protocol.get('cTokenOracle') === undefined) {
        cTokenOracle = (await deployContract(ownerAcc, CTokenMultiOracleArtifact, [])) as CTokenMultiOracle
        console.log(`[CTokenMultiOracle, '${cTokenOracle.address}'],`)
        verify(cTokenOracle.address, [])
        protocol.set('cTokenOracle', cTokenOracle.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        cTokenOracle = (await ethers.getContractAt('CTokenMultiOracle', protocol.get('cTokenOracle') as string, ownerAcc)) as unknown as CTokenMultiOracle
    }
    if (!(await cTokenOracle.hasRole(ROOT, timelock.address)))
        await cTokenOracle.grantRole(ROOT, timelock.address); console.log(`cTokenOracle.grantRoles(ROOT, timelock)`)
        while (!(await compoundOracle.hasRole(ROOT, timelock.address))) { } */

    let uniswapOracle: UniswapV3Oracle
    if (protocol.get('uniswapOracle') === undefined) {
        uniswapOracle = (await deployContract(ownerAcc, UniswapV3OracleArtifact, [])) as UniswapV3Oracle
        console.log(`[UniswapV3Oracle, '${uniswapOracle.address}'],`)
        verify(uniswapOracle.address, [])
        protocol.set('uniswapOracle', uniswapOracle.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        uniswapOracle = (await ethers.getContractAt('UniswapV3Oracle', protocol.get('uniswapOracle') as string, ownerAcc)) as unknown as UniswapV3Oracle
    }
    if (!(await uniswapOracle.hasRole(ROOT, timelock.address))) {
        await uniswapOracle.grantRole(ROOT, timelock.address); console.log(`uniswapOracle.grantRoles(ROOT, timelock)`)
        while (!(await compoundOracle.hasRole(ROOT, timelock.address))) { }
    }

    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, revoke ROOT from the deployer
    const proposal : Array<{ target: string; data: string}> = []

    proposal.push({
        target: compoundOracle.address,
        data: compoundOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(compoundOracle.interface, 'setSource(bytes6,bytes6,address)'),
            ],
            timelock.address
        ])
    })
    console.log(`compoundOracle.grantRoles(gov, timelock)`)

    proposal.push({
        target: compoundOracle.address,
        data: compoundOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`compoundOracle.grantRole(ROOT, cloak)`)

    /* proposal.push({
        target: compoundOracle.address,
        data: compoundOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`compoundOracle.revokeRole(ROOT, deployer)`) */

    proposal.push({
        target: chainlinkOracle.address,
        data: chainlinkOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(chainlinkOracle.interface, 'setSource(bytes6,address,bytes6,address,address)'),
            ],
            timelock.address
        ])
    })
    console.log(`chainlinkOracle.grantRoles(gov, timelock)`)

    proposal.push({
        target: chainlinkOracle.address,
        data: chainlinkOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`chainlinkOracle.grantRole(ROOT, cloak)`)

    /* proposal.push({
        target: chainlinkOracle.address,
        data: chainlinkOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`chainlinkOracle.revokeRole(ROOT, deployer)`) */

    /* proposal.push({
        target: cTokenOracle.address,
        data: cTokenOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(cTokenOracle.interface, 'setSource(bytes6,bytes6,address)'),
            ],
            timelock.address
        ])
    })
    console.log(`cTokenOracle.grantRoles(gov, timelock)`)

    proposal.push({
        target: cTokenOracle.address,
        data: cTokenOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`cTokenOracle.grantRole(ROOT, cloak)`)

    proposal.push({
        target: cTokenOracle.address,
        data: cTokenOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`cTokenOracle.revokeRole(ROOT, deployer)`)

    proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(compositeOracle.interface, 'setSource(bytes6,bytes6,address)'),
                id(compositeOracle.interface, 'setPath(bytes6,bytes6,bytes6[])'),
            ],
            timelock.address
        ])
    })
    console.log(`compositeOracle.grantRoles(gov, timelock)`)

    proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`compositeOracle.grantRole(ROOT, cloak)`)

    proposal.push({
        target: compositeOracle.address,
        data: compositeOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`compositeOracle.revokeRole(ROOT, deployer)`) */

    proposal.push({
        target: uniswapOracle.address,
        data: uniswapOracle.interface.encodeFunctionData('grantRoles', [
            [
                id(uniswapOracle.interface, 'setSource(bytes6,bytes6,address)'),
            ],
            timelock.address
        ])
    })
    console.log(`uniswapOracle.grantRoles(gov, timelock)`)

    proposal.push({
        target: uniswapOracle.address,
        data: uniswapOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`uniswapOracle.grantRole(ROOT, cloak)`)

    /* proposal.push({
        target: uniswapOracle.address,
        data: uniswapOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`uniswapOracle.revokeRole(ROOT, deployer)`) */

    // Propose, approve, execute
    const txHash = await timelock.hash(proposal); console.log(`Proposal: ${txHash}`)
    if ((await timelock.proposals(txHash)).state === 0) { 
        await timelock.propose(proposal); console.log(`Queued proposal for ${txHash}`) 
        while ((await timelock.proposals(txHash)).state < 1) { }; console.log(`Proposed ${txHash}`) 
    }
    if ((await timelock.proposals(txHash)).state === 1) {
        await timelock.approve(txHash); console.log(`Queued approval for ${txHash}`)
        while ((await timelock.proposals(txHash)).state < 2) { }; console.log(`Approved ${txHash}`)
    }
    if ((await timelock.proposals(txHash)).state === 2) { 
        await timelock.execute(proposal); console.log(`Queued execution for ${txHash}`) 
        while ((await timelock.proposals(txHash)).state > 0) { }; console.log(`Executed ${txHash}`) 
    }
})()