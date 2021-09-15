import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import ChainlinkMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol/ChainlinkMultiOracle.json'
import CompoundMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CompoundMultiOracle.sol/CompoundMultiOracle.json'
import CompositeMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/composite/CompositeMultiOracle.sol/CompositeMultiOracle.json'
import CTokenMultiOracleArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/oracles/compound/CTokenMultiOracle.sol/CTokenMultiOracle.json'

import { ChainlinkMultiOracle } from '../typechain/ChainlinkMultiOracle'
import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { CompositeMultiOracle } from '../typechain/CompositeMultiOracle'
import { CTokenMultiOracle } from '../typechain/CTokenMultiOracle'

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
    const [ ownerAcc ] = await ethers.getSigners();
    const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string,string>;
    const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string,string>;

    const cloak = await ethers.getContractAt('EmergencyBrake', governance.get('cloak') as string, ownerAcc) as unknown as EmergencyBrake
    const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc) as unknown as Timelock
    const ROOT = await timelock.ROOT()

    const compoundOracle = (await deployContract(ownerAcc, CompoundMultiOracleArtifact, [])) as CompoundMultiOracle
    console.log(`[CompoundMultiOracle, '${compoundOracle.address}'],`)
    verify(compoundOracle.address, [])
    protocol.set('compoundOracle', compoundOracle.address)
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    await compoundOracle.grantRole(ROOT, timelock.address); console.log(`compoundOracle.grantRoles(ROOT, timelock)`)

    const chainlinkOracle = (await deployContract(ownerAcc, ChainlinkMultiOracleArtifact, [])) as ChainlinkMultiOracle
    console.log(`[ChainlinkMultiOracle, '${chainlinkOracle.address}'],`)
    verify(chainlinkOracle.address, [])
    protocol.set('chainlinkOracle', chainlinkOracle.address)
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    await chainlinkOracle.grantRole(ROOT, timelock.address); console.log(`chainlinkOracle.grantRoles(ROOT, timelock)`)

    const compositeOracle = (await deployContract(ownerAcc, CompositeMultiOracleArtifact, [])) as CompositeMultiOracle
    console.log(`[CompositeMultiOracle, '${compositeOracle.address}'],`)
    verify(compositeOracle.address, [])
    protocol.set('compositeOracle', compositeOracle.address)
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    await compositeOracle.grantRole(ROOT, timelock.address); console.log(`compositeOracle.grantRoles(ROOT, timelock)`)

    const cTokenOracle = (await deployContract(ownerAcc, CTokenMultiOracleArtifact, [])) as CTokenMultiOracle
    console.log(`[CTokenMultiOracle, '${cTokenOracle.address}'],`)
    verify(cTokenOracle.address, [])
    protocol.set('cTokenOracle', cTokenOracle.address)
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    await cTokenOracle.grantRole(ROOT, timelock.address); console.log(`cTokenOracle.grantRoles(ROOT, timelock)`)

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

    proposal.push({
        target: compoundOracle.address,
        data: compoundOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`compoundOracle.revokeRole(ROOT, deployer)`)

    // function setSource(bytes6 baseId, IERC20Metadata base, bytes6 quoteId, IERC20Metadata quote, address source)
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

    proposal.push({
        target: chainlinkOracle.address,
        data: chainlinkOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`chainlinkOracle.revokeRole(ROOT, deployer)`)

    proposal.push({
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
    console.log(`compositeOracle.revokeRole(ROOT, deployer)`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)

})()