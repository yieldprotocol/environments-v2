import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { mapToJson, jsonToMap, verify } from '../shared/helpers'

import CauldronArtifact from '../artifacts/@yield-protocol/vault-v2/contracts/Cauldron.sol/Cauldron.json'

import { Cauldron } from '../typechain/Cauldron'
import { Timelock } from '../typechain/Timelock'
import { EmergencyBrake } from '../typechain/EmergencyBrake'

const { deployContract } = waffle;

/**
 * @dev This script deploys the Cauldron
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

    const cauldron = (await deployContract(ownerAcc, CauldronArtifact, [])) as Cauldron
    console.log(`[Cauldron, '${cauldron.address}'],`)
    verify(cauldron.address, [])
    protocol.set('cauldron', cauldron.address)
    fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    await cauldron.grantRole(ROOT, timelock.address); console.log(`cauldron.grantRoles(ROOT, timelock)`)
    // const cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as Cauldron

    // Give access to each of the governance functions to the timelock, through a proposal to bundle them
    // Give ROOT to the cloak, revoke ROOT from the deployer
    const proposal : Array<{ target: string; data: string}> = []
    proposal.push({
        target: cauldron.address,
        data: cauldron.interface.encodeFunctionData('grantRoles', [
            [
                id(cauldron.interface, 'addAsset(bytes6,address)'),
                id(cauldron.interface, 'addSeries(bytes6,bytes6,address)'),
                id(cauldron.interface, 'addIlks(bytes6,bytes6[])'),
                id(cauldron.interface, 'setDebtLimits(bytes6,bytes6,uint96,uint24,uint8)'),
                id(cauldron.interface, 'setLendingOracle(bytes6,address)'),
                id(cauldron.interface, 'setSpotOracle(bytes6,bytes6,address,uint32)'),
            ],
            timelock.address
        ])
    })
    console.log(`cauldron.grantRoles(gov, timelock)`)

    proposal.push({
        target: cauldron.address,
        data: cauldron.interface.encodeFunctionData('grantRole', [ROOT, cloak.address])
    })
    console.log(`cauldron.grantRole(ROOT, cloak)`)

    proposal.push({
        target: cauldron.address,
        data: cauldron.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address])
    })
    console.log(`cauldron.revokeRole(ROOT, deployer)`)

    // Propose, approve, execute
    const txHash = await timelock.callStatic.propose(proposal)
    await timelock.propose(proposal); console.log(`Proposed ${txHash}`)
    await timelock.approve(txHash); console.log(`Approved ${txHash}`)
    await timelock.execute(proposal); console.log(`Executed ${txHash}`)

})()