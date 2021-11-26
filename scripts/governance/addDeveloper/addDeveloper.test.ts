import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { developerAddress } from './addDeveloper'
import { getGovernanceProtocolAddresses, getOriginalChainId, impersonate } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'
import { Timelock, EmergencyBrake, PoolFactory, Wand } from '../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'

/**
 * @dev This script tests that an dev has propose and execute
 */

describe('Grant developer permissions', function () {
  let timelock: Timelock
  let cloak: EmergencyBrake
  let wand: Wand
  let poolFactory: PoolFactory
  let developerAcc: SignerWithAddress
  let multisigAcc: SignerWithAddress
  let timelockAcc: SignerWithAddress
  let proposal: Array<{ target: string; data: string }>
  let hash: string
  let plan: Array<{ contact: string; signatures: string[] }>
  let planHash: string
  let hashRepeated: string

  before(async () => {
    const chainId = await getOriginalChainId()
    const [governance, protocol] = await getGovernanceProtocolAddresses(chainId)

    developerAcc = await impersonate(`${developerAddress.get(chainId)}`, WAD)
    multisigAcc = await impersonate(governance.get('multisig') as string, WAD)
    timelockAcc = await impersonate(governance.get('timelock') as string, WAD)

    timelock = (await ethers.getContractAt(
      'Timelock',
      governance.get('timelock') as string,
      developerAcc
    )) as unknown as Timelock
    cloak = (await ethers.getContractAt(
      'EmergencyBrake',
      governance.get('cloak') as string,
      developerAcc
    )) as unknown as EmergencyBrake
    poolFactory = (await ethers.getContractAt(
      'PoolFactory',
      protocol.get('poolFactory') as string,
      developerAcc
    )) as unknown as PoolFactory
    wand = (await ethers.getContractAt('Wand', protocol.get('wand') as string, developerAcc)) as Wand

    proposal = [
      {
        target: timelock.address,
        data: timelock.interface.encodeFunctionData('grantRole', ['0x00000000', developerAcc.address]),
      },
    ]
    hash = await timelock.hash(proposal)
    hashRepeated = await timelock.hashRepeated(proposal, 1)
  })

  it('developer can propose and proposeRepeated', async () => {
    await expect(timelock.connect(developerAcc).propose(proposal)).not.to.be.reverted
    await expect(timelock.connect(developerAcc).proposeRepeated(proposal, 1)).not.to.be.reverted
  })

  it('developer cannot approve', async () => {
    await expect(timelock.connect(developerAcc).approve(hash)).to.be.revertedWith('Access denied')
    await expect(timelock.connect(developerAcc).approve(hashRepeated)).to.be.revertedWith('Access denied')
  })

  it('developer can execute and executeRepeated', async () => {
    await timelock.connect(multisigAcc).approve(hash)
    await timelock.connect(multisigAcc).approve(hashRepeated)
    await expect(timelock.connect(developerAcc).execute(proposal)).not.to.be.reverted
    await expect(timelock.connect(developerAcc).executeRepeated(proposal, 1)).not.to.be.reverted
  })

  it('developer can execute on cloak - but nothing else', async () => {
    plan = [
      {
        contact: poolFactory.address,
        signatures: [id(poolFactory.interface, 'createPool(address,address)')],
      },
    ]
    planHash = await cloak.hash(wand.address, plan)

    // Try and fail to plan with the developer
    await expect(cloak.connect(developerAcc).plan(wand.address, plan)).to.be.revertedWith('Access denied')

    // Use the timelock to lodge a plan
    await cloak.connect(timelockAcc).plan(wand.address, plan)

    // Try and fail to cancel the plan
    await expect(cloak.connect(developerAcc).cancel(planHash)).to.be.revertedWith('Access denied')

    // Try and fail to terminate the plan
    await expect(cloak.connect(developerAcc).terminate(planHash)).to.be.revertedWith('Access denied')

    // Try and fail to restore the plan
    await expect(cloak.connect(developerAcc).restore(planHash)).to.be.revertedWith('Access denied')

    // Developer can successfully execute the plan
    await expect(cloak.connect(developerAcc).execute(planHash)).not.to.be.reverted
  })
})
