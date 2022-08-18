import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { IDENTITY } from '../../../../shared/constants'
import { writeAddressMap } from '../../../../shared/helpers'
import { IdentityOracle } from '../../../../typechain'

export const deployIdentityOracle = async (ownerAcc: SignerWithAddress, protocol: Map<string, string>) => {
  const address = protocol.get(IDENTITY)
  let oracle: IdentityOracle

  if (address === undefined) {
    const _oracle = await (await ethers.getContractFactory('IdentityOracle')).deploy()
    oracle = await _oracle.deployed()
    console.log(`IdentityOracle deployed at ${oracle.address}`)
    protocol.set(IDENTITY, oracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    oracle = await ethers.getContractAt('IdentityOracle', address, ownerAcc)
    console.log(`Reusing IdentityOracle at ${oracle.address}`)
  }
  return oracle
}
