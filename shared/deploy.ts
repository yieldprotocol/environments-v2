import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { FactoryOptions } from 'hardhat/types'

import { verify, getOwnerOrImpersonate, readAddressMappingIfExists, writeAddressMap } from './helpers'
import { Timelock, Timelock__factory } from '../typechain'
import { TIMELOCK, ROOT } from './constants'
import { ContractDeployment } from '../scripts/governance/confTypes'

const { deployer, governance, contractDeployments } = require(process.env.CONF as string)

/**
 * @dev Deploy a contract, verifies it, stores it in a database, and gives ROOT to the Timelock
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

  // Give ROOT to the Timelock only if we haven't done so yet, and only if the contract inherits AccessControl
  if (deployment.interface.functions['ROOT()'] && !(await deployment.hasRole(ROOT, timelock.address))) {
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

/**
 * @dev This script deploys contracts as defined in a proposal config file containing a contractDeployments:ContractDeployment[] export.
 */
;(async () => {
  let deployerAcc = await getOwnerOrImpersonate(deployer as string)
  const timelock = Timelock__factory.connect(governance.get(TIMELOCK)!, deployerAcc)

  for (let contractDeployment of contractDeployments) {
    const contractToDeploy: ContractDeployment = contractDeployment // Only way I know to cast this

    const deployedAddress = readAddressMappingIfExists(contractToDeploy.addressFile).get(contractToDeploy.name)
    let deployedContract: Contract
    if (deployedAddress === undefined) {
      deployedContract = await deploy(
        timelock,
        contractToDeploy.addressFile,
        contractToDeploy.name,
        await ethers.getContractFactory(contractToDeploy.contract, deployerAcc),
        ...contractToDeploy.args
      )
    } else {
      console.log(`Reusing ${contractToDeploy.name} at: ${deployedAddress}`)
    }
  }
})()
