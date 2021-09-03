import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { verify, mapToJson, jsonToMap } from '../shared/helpers'

import TimelockArtifact from '../artifacts/@yield-protocol/utils-v2/contracts/utils/Timelock.sol/Timelock.json'
import { Timelock } from '../typechain/Timelock'

const { deployContract } = waffle

// const multisig = fs.readFileSync('.multisig', 'utf8').trim();
const governance = jsonToMap(fs.readFileSync('./output/governance.json', 'utf8')) as Map<string, string>;

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const multisig = ownerAcc.address
    const timelock = (await deployContract(ownerAcc, TimelockArtifact, [multisig])) as unknown as Timelock
    console.log(`[Timelock, '${timelock.address}'],`)
    verify(timelock.address, [multisig])

    governance.set('timelock', timelock.address)
    fs.writeFileSync('./output/governance.json', mapToJson(governance), 'utf8')
})()
