import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'
import { ROOT } from '../../shared/constants'
import { verify, readAddressMappingIfExists, writeAddressMap } from '../../shared/helpers'
import { Timelock } from '../../typechain'
/**
 * @dev This script deploys a contract, verifies it, stores it in a database, and gives ROOT to the Timelock
 * The Timelock gets ROOT access.
 */
export const deploy = async (
  deployer: SignerWithAddress,
  timelock: Timelock,
  addressFile: string, // The json file to store the address in
  objectPath: string, // The path to the .sol file to deploy
  name: string, // The unique name to the contract
  args?: string[], // The arguments to the constructor
  libs?: { [id: string]: string } // The libraries to the constructor
): Promise<Contract> => {
  const contractFactory = await ethers.getContractFactory(objectPath, {
    libraries: libs,
    signer: deployer,
  })

  const deployment: Contract = await contractFactory.deploy(args)

  await deployment.deployed()
  console.log(`${name} deployed at ${deployment.address}`)

  const addressMap = readAddressMappingIfExists(addressFile)
  addressMap.set(name, deployment.address)
  writeAddressMap(addressFile, addressMap)

  verify(name, deployment, args, libs)

  if (!(await deployment.hasRole(ROOT, timelock.address))) {
    await (await deployment.grantRole(ROOT, timelock.address)).wait(1)
    console.log(`${name}.grantRoles(ROOT, timelock)`)
  }

  return deployment
}
