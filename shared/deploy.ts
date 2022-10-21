import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { FactoryOptions } from 'hardhat/types'

import { verify, getOwnerOrImpersonate, readAddressMappingIfExists, writeAddressMap } from './helpers'
import { Timelock__factory } from '../typechain'
import { TIMELOCK, ROOT } from './constants'
import { ContractDeployment } from '../scripts/governance/confTypes'

const { deployer, governance, contractDeployments } = require(process.env.CONF as string)

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
      const contractFactory = await ethers.getContractFactory(contractToDeploy.contract, deployerAcc)

      deployedContract = await contractFactory.deploy(...contractToDeploy.args)

      await deployedContract.deployed()
      console.log(`${contractToDeploy.name} deployed at ${deployedContract.address}`)

      const addressMap = readAddressMappingIfExists(contractToDeploy.addressFile)
      addressMap.set(contractToDeploy.name, deployedContract.address)
      // writeAddressMap(contractToDeploy.addressFile, addressMap)

      verify(contractToDeploy.name, deployedContract, contractToDeploy.args, contractToDeploy.libs)

      // Give ROOT to the Timelock only if we haven't done so yet, and only if the contract inherits AccessControl
      if (deployedContract.interface.functions['ROOT()'] && !(await deployedContract.hasRole(ROOT, timelock.address))) {
        await (await deployedContract.grantRole(ROOT, timelock.address)).wait(1)
        console.log(`${contractToDeploy.name}.grantRoles(ROOT, timelock)`)
      }
    } else {
      console.log(`Reusing ${contractToDeploy.name} at: ${deployedAddress}`)
    }
  }
})()
