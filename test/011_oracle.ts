import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { DEC6 } from '../shared/constants'

import { OracleMock as Oracle } from '../typechain/OracleMock'
import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'

import { VaultEnvironment } from '../fixtures/vault'
import { fixture } from '../environments/testing';
const { loadFixture } = waffle

describe('Oracle', function () {
  this.timeout(0)
  let level0: Number
  let level1: Number
  let level2: Number

  let env: VaultEnvironment
  let ownerAcc: SignerWithAddress
  let owner: string
  let oracle: Oracle

  const pastMaturity = 1600000000

  before(async () => {
    env = await loadFixture(fixture);
    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()
    oracle = (await ethers.getContractAt('OracleMock', '0x82e01223d51Eb87e16A03E24687EDF0F294da6f1')) as Oracle
    level0 = await ethers.provider.send('evm_snapshot', [])
  })

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [level0])
  })

  it('sets and retrieves the spot price', async () => {
    await oracle.set(1)
    expect(await oracle.spot()).to.equal(1)
  })

  describe('with a spot price', async () => {
    beforeEach(async () => {
      level1 = await ethers.provider.send('evm_snapshot', [])
      
      await oracle.set(1)
    })

    afterEach(async () => {
      await ethers.provider.send('evm_revert', [level1])
    })

    it('records and retrieves the spot price', async () => {
      expect(await oracle.record(pastMaturity))
        .to.emit(oracle, 'Recorded')
        .withArgs(pastMaturity, 1)

      await oracle.set(2) // Just to be sure we are retrieving the recorded value
      expect(await oracle.recorded(pastMaturity)).to.equal(1)
    })

    describe('with a recorded price', async () => {
      beforeEach(async () => {
        level2 = await ethers.provider.send('evm_snapshot', [])

        await oracle.record(pastMaturity)
      })

      afterEach(async () => {
        await ethers.provider.send('evm_revert', [level2])
      })

      it('retrieves the spot price accrual', async () => {
        await oracle.set(2) // Just to be sure we are retrieving the recorded value
        expect(await oracle.accrual(pastMaturity)).to.equal(DEC6.mul(2))
      })
    })
  })
})
