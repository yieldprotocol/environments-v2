import { ethers } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { revokeDevelopers, developer } from './revokeDevelopers.config'
import { readAddressMappingIfExists, getOwnerOrImpersonate, impersonate } from '../../../../shared/helpers'
import { WAD } from '../../../../shared/constants'
import { Timelock, EmergencyBrake } from '../../../../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'

/**
 * @dev This script tests that an dev doesn't has propose, execute & repeated permissions.
 */

describe('Revoke developer permissions', function () {
  let timelock: Timelock
  let cloak: EmergencyBrake

  let developerAcc: SignerWithAddress
  let activeDeveloperAcc: SignerWithAddress
  let multisigAcc: SignerWithAddress
  let timelockAcc: SignerWithAddress
  let proposal: Array<{ target: string; data: string }>
  let hash: string
  let plan: Array<{ contact: string; signatures: string[] }>
  let planHash: string
  let hashRepeated: string
  let dummyDevelopers: string[] = [
    '0xa2AA74D8542a917a51601F0105e03feBbDE52Eed',
    '0x92f0fB6a6Ebcd7c32123288144C7B8C7fbF86021',
    '0xEe9801669C6138E84bD50dEB500827b776777d28',
  ]
  let count: number = 0
  for (let newDeveloper of revokeDevelopers) {
    before(async () => {
      const governance = readAddressMappingIfExists('governance.json')
      const protocol = readAddressMappingIfExists('protocol.json')

      developerAcc = await impersonate(newDeveloper, WAD)
      activeDeveloperAcc = await impersonate(developer, WAD)

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

      proposal = [
        {
          target: timelock.address,
          data: timelock.interface.encodeFunctionData('grantRole', ['0x00000000', dummyDevelopers[count]]),
        },
      ]
      count = count + 1
      hash = await timelock.hash(proposal)
      hashRepeated = await timelock.hashRepeated(proposal, 1)
    })

    it('developer cannot propose and proposeRepeated', async () => {
      await expect(timelock.connect(developerAcc).propose(proposal)).to.be.reverted
      await expect(timelock.connect(developerAcc).proposeRepeated(proposal, 1)).to.be.reverted
    })

    it('developer cannot approve', async () => {
      await expect(timelock.connect(developerAcc).approve(hash)).to.be.reverted
      await expect(timelock.connect(developerAcc).approve(hashRepeated)).to.be.reverted
    })

    it('developer cannot execute and executeRepeated', async () => {
      try {
        await timelock.connect(activeDeveloperAcc).propose(proposal)
        await timelock.connect(activeDeveloperAcc).proposeRepeated(proposal, 1)
        await timelock.connect(multisigAcc).approve(hash)
        await timelock.connect(multisigAcc).approve(hashRepeated)
      } catch (error) {}
      await expect(timelock.connect(developerAcc).execute(proposal)).to.be.reverted
      await expect(timelock.connect(developerAcc).executeRepeated(proposal, 1)).to.be.reverted
    })

    it('developer cannot execute on cloak - but nothing else', async () => {
      plan = [
        {
          contact: timelock.address,
          signatures: [id(timelock.interface, 'setDelay(uint32)')],
        },
      ]
      planHash = await cloak.hash(timelock.address, plan)
      // Use the timelock to lodge a plan
      try {
        await cloak.connect(timelockAcc).plan(timelock.address, plan)
      } catch (error) {}

      // Developer cannot execute the plan
      await expect(cloak.connect(developerAcc).execute(planHash)).to.be.reverted
    })
  }
})
