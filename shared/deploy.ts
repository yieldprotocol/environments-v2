import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { FactoryOptions } from 'hardhat/types'

import { verify, getOwnerOrImpersonate, readAddressMappingIfExists, writeAddressMap, tenderlyVerify } from './helpers'
import { Timelock__factory } from '../typechain'
import { TIMELOCK, ROOT } from './constants'
import { ContractDeployment } from '../scripts/governance/confTypes'

const { deployer, governance, contractDeployments } = require(process.env.CONF as string)

/**
 * @dev This script deploys contracts as defined in a proposal config file containing a contractDeployments:ContractDeployment[] export.
 */
;(async () => {
  let deployerAcc = await getOwnerOrImpersonate(deployer as string)
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), deployerAcc)

  for (let params_ of contractDeployments) {
    const params: ContractDeployment = params_ // Only way I know to cast this

    const deployedAddress = readAddressMappingIfExists(params.addressFile).get(params.name)
    let deployed: Contract
    if (deployedAddress === undefined) {
      const factoryOptions: FactoryOptions = { libraries: params.libs }
      const contractFactory = await ethers.getContractFactory(params.contract, factoryOptions)

      deployed = await contractFactory.deploy(...params.args.map((f) => f()))

      await deployed.deployed()
      console.log(`${params.name} deployed at ${deployed.address}`)

      const addressMap = readAddressMappingIfExists(params.addressFile)
      addressMap.set(params.name, deployed.address)
      writeAddressMap(params.addressFile, addressMap)

      verify(params.name, deployed, params.args, params.libs)

      // Give ROOT to the Timelock only if we haven't done so yet, and only if the contract inherits AccessControl
      if (deployed.interface.functions['ROOT()'] && !(await deployed.hasRole(ROOT, timelock.address))) {
        await (await deployed.grantRole(ROOT, timelock.address)).wait(1)
        console.log(`${params.name}.grantRoles(ROOT, timelock)`)
      }
    } else {
      const factoryOptions: FactoryOptions = { libraries: params.libs }
      const contractFactory = await ethers.getContractAt(params.contract, deployedAddress)
      await tenderlyVerify(params.contract, contractFactory)
      console.log(`Reusing ${params.name} at: ${deployedAddress}`)
    }
  }
})()
