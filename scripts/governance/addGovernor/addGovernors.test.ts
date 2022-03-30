import { ethers } from 'hardhat'

import { readAddressMappingIfExists, impersonate } from '../../../shared/helpers'
import { WAD } from '../../../shared/constants'
import { Timelock, EmergencyBrake } from '../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { newGovernors } from './addGovernors.mainnet.config'

/**
 * @dev This script tests the permissions for a governor
 * Execute as `npx hardhat test <path>/addGovernor.test.ts`, copying the addresses to `./addresses/hardhat` before.
 */

describe('Grant governor permissions', function () {
  let timelock: Timelock
  let cloak: EmergencyBrake
  let governorAcc: SignerWithAddress
  let multisigAcc: SignerWithAddress
  let timelockAcc: SignerWithAddress
  let proposal: Array<{ target: string; data: string }>
  let hash: string
  let plan: Array<{ contact: string; signatures: string[] }>
  let planHash: string
  let hashRepeated: string

  for (let newGovernor of newGovernors) {
    before(async () => {
      const governance = readAddressMappingIfExists('governance.json')

      governorAcc = await impersonate(newGovernor, WAD)
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
          data: timelock.interface.encodeFunctionData('grantRole', ['0x00000000', governorAcc.address]),
        },
      ]
      hash = await timelock.hash(proposal)
      hashRepeated = await timelock.hashRepeated(proposal, 1)
    })

    it('governor can propose and proposeRepeated', async () => {
      await expect(timelock.connect(governorAcc).propose(proposal)).not.to.be.reverted
      await expect(timelock.connect(governorAcc).proposeRepeated(proposal, 1)).not.to.be.reverted
    })

    it('governor can approve', async () => {
      await expect(timelock.connect(governorAcc).approve(hash)).not.to.be.reverted
      await expect(timelock.connect(governorAcc).approve(hashRepeated)).not.to.be.reverted
    })

    it('governor can execute and executeRepeated', async () => {
      await timelock.connect(multisigAcc).approve(hash)
      await timelock.connect(multisigAcc).approve(hashRepeated)
      await expect(timelock.connect(governorAcc).execute(proposal)).not.to.be.reverted
      await expect(timelock.connect(governorAcc).executeRepeated(proposal, 1)).not.to.be.reverted
    })

    it('governor can do anything on cloak', async () => {
      plan = [
        {
          contact: cloak.address,
          signatures: ['0xde8a0667'], // id(cloak.interface, 'plan(address,tuple[])'),
        },
      ]
      planHash = await cloak.hash(timelock.address, plan)

      // Plan with the governor
      await expect(cloak.connect(governorAcc).plan(timelock.address, plan)).not.to.be.reverted

      // Cancel the plan
      await expect(cloak.connect(governorAcc).cancel(planHash)).not.to.be.reverted

      // Plan with the governor again
      await expect(cloak.connect(governorAcc).plan(timelock.address, plan)).not.to.be.reverted

      // Execute the plan
      await expect(cloak.connect(governorAcc).execute(planHash)).not.to.be.reverted

      // Restore the orchestration
      await expect(cloak.connect(governorAcc).restore(planHash)).not.to.be.reverted

      // Execute the plan again
      await expect(cloak.connect(governorAcc).execute(planHash)).not.to.be.reverted

      // Terminate the orchestration
      await expect(cloak.connect(governorAcc).terminate(planHash)).not.to.be.reverted
    })
  }
})
