import { ethers } from 'hardhat'
import { developerAddress } from './addDeveloper'
import { getGovernanceProtocolAddresses, getOriginalChainId, impersonate } from '../../../../shared/helpers'
import { WAD } from '../../../../shared/constants'
import { Timelock, EmergencyBrake } from '../../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'

/**
 * @dev This script tests that an dev has propose and execute
 */

describe('Grant developer permissions', function () {
  let timelock: Timelock
  let cloak: EmergencyBrake
  const governor: string = '0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708'
  let governorAcc: SignerWithAddress
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
    const [governance, _] = await getGovernanceProtocolAddresses(chainId)

    developerAcc = await impersonate(`${developerAddress.get(chainId)}`, WAD)
    governorAcc = await impersonate(governor, WAD)
    multisigAcc = await impersonate(governance.get('multisig') as string, WAD)
    timelockAcc = await impersonate(governance.get('timelock') as string, WAD)

    timelock = (await ethers.getContractAt(
      'Timelock',
      governance.get('timelock') as string,
      governorAcc
    )) as unknown as Timelock
    cloak = (await ethers.getContractAt(
      'EmergencyBrake',
      governance.get('cloak') as string,
      governorAcc
    )) as unknown as EmergencyBrake
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
        contact: cloak.address,
        signatures: ['0xde8a0667'],
      },
    ]
    planHash = await cloak.hash(timelock.address, plan)

    // Try and fail to plan with the developer
    await expect(cloak.connect(developerAcc).plan(timelock.address, plan)).to.be.revertedWith('Access denied')

    // Use the timelock to lodge a plan
    await cloak.connect(timelockAcc).plan(timelock.address, plan)

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
