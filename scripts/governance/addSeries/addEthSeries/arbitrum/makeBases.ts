import {ethers} from 'hardhat'
import {getOwnerOrImpersonate, proposeApproveExecute} from '../../../../../shared/helpers'

import {makeBaseProposal} from '../../../../fragments/assetsAndSeries/makeBaseProposal'

import {
  AccumulatorMultiOracle,
  Cauldron,
  EmergencyBrake,
  IOracle,
  Ladle,
  Timelock,
  Witch
} from '../../../../../typechain'
import {ACCUMULATOR} from '../../../../../shared/constants';

const {
    developer,
    protocol,
    governance,
    bases,
} = require(process.env.CONF as string);

;(async () => {
    const ownerAcc = await getOwnerOrImpersonate(developer)

    const accumulatorOracle = ((await ethers.getContractAt(
        'AccumulatorMultiOracle',
        protocol.get(ACCUMULATOR) as string,
        ownerAcc
    )) as unknown) as AccumulatorMultiOracle
    const cauldron = (await ethers.getContractAt(
        'Cauldron',
        protocol.get('cauldron') as string,
        ownerAcc
    )) as unknown as Cauldron
    const ladle = (await ethers.getContractAt(
        'Ladle',
        protocol.get('ladle') as string,
        ownerAcc
    )) as unknown as Ladle
    const witch = (await ethers.getContractAt(
        'Witch',
        protocol.get('witch') as string,
        ownerAcc
    )) as unknown as Witch
    const cloak = (await ethers.getContractAt(
        'EmergencyBrake',
        governance.get('cloak') as string,
        ownerAcc
    )) as unknown as EmergencyBrake
    const timelock = (await ethers.getContractAt(
        'Timelock',
        governance.get('timelock') as string,
        ownerAcc
    )) as unknown as Timelock

    let proposal: Array<{ target: string; data: string }> = []
    proposal = proposal.concat(await makeBaseProposal(
        ownerAcc,
        accumulatorOracle as unknown as IOracle,
        cauldron,
        ladle,
        witch,
        cloak,
        bases
    ))

    await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
