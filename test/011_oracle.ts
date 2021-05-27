import *  as fs from 'fs'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { constants } from '@yield-protocol/utils-v2'
const { WAD } = constants
import { CHI, RATE, DAI } from '../shared/constants'

import { ethers, waffle } from 'hardhat'
import { expect } from 'chai'
import { jsonToMap } from '../shared/helpers'

import { CompoundMultiOracle } from '../typechain/CompoundMultiOracle'
import { ISourceMock } from '../typechain/ISourceMock'


function bytes6ToBytes32(x: string): string {
  return x + '00'.repeat(26)
}

describe('Oracle', function () {
  this.timeout(0)

  const chiSources = jsonToMap(fs.readFileSync('./output/chiSources.json', 'utf8')) as Map<string, string>;
  const protocol = jsonToMap(fs.readFileSync('./output/protocol.json', 'utf8')) as Map<string, string>;
  let ownerAcc: SignerWithAddress
  let owner: string
  let oracle: CompoundMultiOracle
  let source: ISourceMock


  before(async () => {
    const signers = await ethers.getSigners()
    ownerAcc = signers[0]
    owner = await ownerAcc.getAddress()
    oracle = await ethers.getContractAt('CompoundMultiOracle', protocol.get('compoundOracle') as string, ownerAcc) as CompoundMultiOracle
    source = await ethers.getContractAt('ISourceMock', chiSources.get(DAI) as string, ownerAcc) as ISourceMock
  })

  it('sets and retrieves the chi value', async () => {
    await source.set(WAD.mul(2))
    expect((await oracle.callStatic.get(bytes6ToBytes32(DAI), bytes6ToBytes32(RATE), WAD))[0]).to.equal(WAD.mul(2))
  })
})
