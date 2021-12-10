import { ethers } from 'hardhat'
import * as fs from 'fs'
import { id } from '@yield-protocol/utils-v2'
import { jsonToMap, impersonate, getOriginalChainId } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'

/**
 * @dev This script tests that an user doesn't have governor permissions
 */

describe('Revoke governor permissions', function () {
  let timelock: Timelock
  let cloak: EmergencyBrake
  const governor: string = '0xA072f81Fea73Ca932aB2B5Eda31Fa29306D58708'
  let governorAcc: SignerWithAddress
  let multisigAcc: SignerWithAddress
  let timelockAcc: SignerWithAddress

  before(async () => {
    const chainId = await getOriginalChainId()
      const path = chainId === 1 ? './addresses/mainnet/' : './addresses/kovan/'
  
    const governance = jsonToMap(fs.readFileSync(path + 'governance.json', 'utf8')) as Map<string, string>
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
  })

  it('test', async () => {
    const proposal: Array<{ target: string; data: string }> = [{ 
      target: timelock.address,
      data: timelock.interface.encodeFunctionData('grantRole',['0x00000000', governorAcc.address])
    }]
    const hash = await timelock.hash(proposal)
    const hashRepeated = await timelock.hashRepeated(proposal, 1)
    // Try and fail to propose
    await expect(timelock.connect(governorAcc).propose(proposal)).to.be.revertedWith('Access denied')
    
    // Try and fail to proposeRepeated
    await expect(timelock.connect(governorAcc).proposeRepeated(proposal, 1)).to.be.revertedWith('Access denied')

    // Use the multisig to propose giving ROOT in the Timelock to the governor
    await timelock.connect(multisigAcc).propose(proposal)

    // Use the multisig to proposeRepeated giving ROOT in the Timelock to the governor
    await timelock.connect(multisigAcc).proposeRepeated(proposal, 1)

    // Try and fail to approve
    await expect(timelock.connect(governorAcc).approve(hash)).to.be.revertedWith('Access denied')

    // Use the multisig to approve both proposals
    await timelock.connect(multisigAcc).approve(hash)
    await timelock.connect(multisigAcc).approve(hashRepeated)

    // Try and fail to execute
    await expect(timelock.connect(governorAcc).execute(proposal)).to.be.revertedWith('Access denied')

    // Try and fail to executeRepeated
    await expect(timelock.connect(governorAcc).executeRepeated(proposal, 1)).to.be.revertedWith('Access denied')

    const plan = [
      {
        contact: cloak.address,
        signatures: ['0xde8a0667'],
      },
    ]

    // Executing this plan would fail because the cloak doesn't have ROOT on the Timelock, but we are not going to get there anyway.
    const planHash = await cloak.hash(timelock.address, plan)

    // Try and fail to plan with the old governor
    await expect(cloak.connect(governorAcc).plan(timelock.address, plan)).to.be.revertedWith('Access denied')

    // Use the timelock to lodge a plan
    await cloak.connect(timelockAcc).plan(timelock.address, plan)

    // Try and fail to cancel the plan
    await expect(cloak.connect(governorAcc).cancel(planHash)).to.be.revertedWith('Access denied')

    // Try and fail to execute the plan
    await expect(cloak.connect(governorAcc).execute(planHash)).to.be.revertedWith('Access denied')

    // Try and fail to terminate the plan
    await expect(cloak.connect(governorAcc).terminate(planHash)).to.be.revertedWith('Access denied')

    // Try and fail to restore the plan
    await expect(cloak.connect(governorAcc).restore(planHash)).to.be.revertedWith('Access denied')
  })
})
