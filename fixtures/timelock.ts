import { ethers, waffle } from 'hardhat'
import *  as fs from 'fs'
import { verify } from '../shared/helpers'

import TimeLockArtifact from '../artifacts/@yield-protocol/utils-v2/contracts/utils/TimeLock.sol/TimeLock.json'
import { TimeLock } from '../typechain/TimeLock'

const { deployContract } = waffle

console.time("Timelock deployed in");

const multisig = fs.readFileSync('.multisig', 'utf8').trim();

(async () => {
    const [ ownerAcc ] = await ethers.getSigners();
    const timelock = (await deployContract(ownerAcc, TimeLockArtifact, [multisig])) as unknown as TimeLock
    console.log(`[TimeLock, '${timelock.address}'],`)
    verify(timelock.address, [multisig])

    console.timeEnd("Timelock deployed in")
})()
