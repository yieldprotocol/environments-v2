import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers} from 'hardhat'
import { TV_POOL } from '../../../shared/constants'
import { writeAddressMap } from '../../../shared/helpers'
import { PoolOracle } from '../../../typechain'


const _24hours = 60 * 60 * 24
const _5minutes = 60 * 5
export const deployTVPoolOracle = async (
  ownerAcc: SignerWithAddress,
  protocol: Map<string, string>,
) => {
  let poolOracle: PoolOracle
  const address = protocol.get(TV_POOL)

  if (address === undefined) {
    const factory = await ethers.getContractFactory('PoolOracle', ownerAcc)
    poolOracle = await factory.deploy(_24hours, 24, _5minutes)
    console.log(`TVPoolOracle deployed at ${poolOracle.address}`)
    protocol.set(TV_POOL, poolOracle.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    poolOracle = await ethers.getContractAt(
      'PoolOracle',
      address,
      ownerAcc
    )
    console.log(`Reusing TVPoolOracle at ${poolOracle.address}`)
  }
  await poolOracle.deployed()
  return poolOracle
}




