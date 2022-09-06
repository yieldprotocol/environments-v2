import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers, network } from 'hardhat'
import { IDENTITY } from '../../../../shared/constants'
import { tenderlyVerify, verify, writeAddressMap } from '../../../../shared/helpers'
import { IdentityOracle } from '../../../../typechain'
const hre = require('hardhat')
export const deployIdentityOracle = async (ownerAcc: SignerWithAddress, protocol: Map<string, string>) => {
  const address = protocol.get(IDENTITY)
  let oracle: IdentityOracle

  if (address === undefined) {
    oracle = await (await ethers.getContractFactory('IdentityOracle')).deploy()
    await oracle.deployed()
    console.log(`IdentityOracle deployed at ${oracle.address}`)
    protocol.set(IDENTITY, oracle.address)
    verify(oracle.address, [])
    writeAddressMap('protocol.json', protocol)
    tenderlyVerify('IdentityOracle', oracle)
  } else {
    oracle = await ethers.getContractAt('IdentityOracle', address, ownerAcc)
    console.log(`Reusing IdentityOracle at ${oracle.address}`)
  }
  return oracle
}
