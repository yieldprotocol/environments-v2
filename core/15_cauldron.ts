import { ethers, waffle } from 'hardhat'
import *  as hre from 'hardhat'
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

    let cauldron: Cauldron
    if (protocol.get('cauldron') === undefined) {
        cauldron = (await deployContract(ownerAcc, CauldronArtifact, [])) as Cauldron
        console.log(`[Cauldron, '${cauldron.address}'],`)
        verify(cauldron.address, [])
        protocol.set('cauldron', cauldron.address)
        fs.writeFileSync('./output/protocol.json', mapToJson(protocol), 'utf8')
    } else {
        cauldron = await ethers.getContractAt('Cauldron', protocol.get('cauldron') as string, ownerAcc) as Cauldron
    }
    if (!(await cauldron.hasRole(ROOT, timelock.address))) {
        await cauldron.grantRole(ROOT, timelock.address); console.log(`cauldron.grantRoles(ROOT, timelock)`)
        while (!(await cauldron.hasRole(ROOT, timelock.address))) { }
    }

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