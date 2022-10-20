import { Contract } from 'ethers'
import { ethers } from 'hardhat'
import { FactoryOptions } from 'hardhat/types'
import { ROOT } from '../../shared/constants'
import { verify, readAddressMappingIfExists, writeAddressMap } from '../../shared/helpers'
import { Timelock } from '../../typechain'
/**
 * @dev This script deploys a contract, verifies it, stores it in a database, and gives ROOT to the Timelock
 * The Timelock gets ROOT access.
 */

// NOTE:
// due to 'ethers.getContractFactory' having multiple overloads, it is not possible to
// generify the fuction to take the parameters and infer the return type (<T extndends Parameters<typeof ethers.getContractFactory>>)
// Therefore, the best we can do is to take the awaited factory as a parameter, and let TS infer the correct params
// of deploy(). Due to this, we don't have visibility of the libs, meaning the verify() on line 34 won't work if there are libs
// The easy way to solve that would be to have 2 overloads of this deploy() function, where in one impl you take the libs as explicit arguments.
// See below (and maybe refactor these two to extract common logic :) )
export const deploy = async <Factory extends Awaited<ReturnType<typeof ethers.getContractFactory>>>(
  timelock: Timelock,
  addressFile: string, // The json file to store the address in
  name: string, // The unique name to the contract
  contractFactory: Factory, // The path to the .sol file to deploy
  ...args: Parameters<typeof contractFactory['deploy']>
): Promise<Contract> => {
  const deployment: Contract = await contractFactory.deploy(...args)

  await deployment.deployed()
  console.log(`${name} deployed at ${deployment.address}`)

  const addressMap = readAddressMappingIfExists(addressFile)
  addressMap.set(name, deployment.address)
  writeAddressMap(addressFile, addressMap)

  verify(name, deployment, args)

  if (!(await deployment.hasRole(ROOT, timelock.address))) {
    await (await deployment.grantRole(ROOT, timelock.address)).wait(1)
    console.log(`${name}.grantRoles(ROOT, timelock)`)
  }

  return deployment
}

export const deployWithLibs = async <Factory extends Awaited<ReturnType<typeof ethers.getContractFactory>>>(
  timelock: Timelock,
  addressFile: string, // The json file to store the address in
  name: string, // The unique name to the contract
  libs: FactoryOptions['libraries'],
  contractFactory: Factory, // The path to the .sol file to deploy
  ...args: Parameters<typeof contractFactory['deploy']>
): Promise<Contract> => {
  const deployment: Contract = await contractFactory.deploy(...args)

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
