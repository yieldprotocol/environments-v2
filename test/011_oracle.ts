import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import { constants } from '@yield-protocol/utils-v2'
const { WAD } = constants
import { CHI, RATE, DAI } from '../shared/constants'

import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { SourceMock } from '../typechain/SourceMock'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'

import { VaultEnvironment } from '../fixtures/vault'
import { fixture } from '../environments/testing';
const { loadFixture } = waffle

function bytes6ToBytes32(x: string): string {
  return x + '00'.repeat(26)
}

describe('Oracle', function () {
  this.timeout(0)

  let env: VaultEnvironment
  let ownerAcc: SignerWithAddress
  let owner: string
  let oracle: CompoundMultiOracle
  let source: SourceMock

  before(async () => {
    env = await loadFixture(fixture);
    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()
    oracle = (env.oracles.get(RATE) as unknown) as CompoundMultiOracle
    source = (await ethers.getContractAt('SourceMock', await oracle.sources(DAI, CHI))) as SourceMock
  })

  it('sets and retrieves the value at spot price', async () => {
    await source.set(WAD.mul(2))
    expect((await oracle.callStatic.get(bytes6ToBytes32(DAI), RATE, WAD))[0]).to.equal(WAD.mul(2))
  })
})
