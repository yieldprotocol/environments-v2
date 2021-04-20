import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import { OracleMock as Oracle } from '../typechain/OracleMock'
import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'

import { VaultEnvironment } from '../fixtures/vault'
import { fixture } from '../environments/testing';
const { loadFixture } = waffle

describe('Oracle', function () {
  this.timeout(0)
  let clean: Number

  let env: VaultEnvironment
  let ownerAcc: SignerWithAddress
  let owner: string
  let oracle: Oracle

  before(async () => {
    env = await loadFixture(fixture);
    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()
    oracle = (await ethers.getContractAt('OracleMock', '0x162A433068F51e18b7d13932F27e66a3f99E6890')) as Oracle
  })

  it('sets and retrieves the spot price', async () => {
    clean = await ethers.provider.send('evm_snapshot', [])

    await oracle.set(1)
    expect((await oracle.callStatic.get())[0]).to.equal(1)
    expect((await oracle.peek())[0]).to.equal(1)

    await ethers.provider.send('evm_revert', [clean])
  })
})
