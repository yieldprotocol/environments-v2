import { ethers } from 'hardhat'
import { Contract } from 'ethers'
import { FactoryOptions } from 'hardhat/types'

import { verify, getOwnerOrImpersonate, readAddressMappingIfExists, writeAddressMap, getName } from './helpers'
import { Timelock__factory } from '../typechain'
import { TIMELOCK, ROOT } from './constants'
import { ContractDeployment } from '../scripts/governance/confTypes'

const { developer, governance, contractDeployments } = require(process.env.CONF as string)

/**
 * @dev This script deploys contracts as defined in a proposal config file containing a contractDeployments:ContractDeployment[] export.
 */
;(async () => {
  let deployerAcc = (await ethers.getSigners())[0] // We never impersonate when deploying
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), deployerAcc)

  for (let params_ of contractDeployments) {
    const params: ContractDeployment = params_ // Only way I know to cast this

    const deployedAddress = readAddressMappingIfExists(params.addressFile).get(params.name)
    let deployed: Contract
    if (deployedAddress === undefined) {
      const factoryOptions: FactoryOptions = { signer: deployerAcc, libraries: params.libs }
      const contractFactory = await ethers.getContractFactory(params.contract, factoryOptions)

      console.log(`Deployer: ${deployerAcc.address} - ${deployerAcc._isSigner ? 'Signer' : 'Impersonator'}`)
      console.log(`ETH Balance: ${ethers.utils.formatEther(await deployerAcc.getBalance())}`)
      console.log(`Gas Price: ${ethers.utils.formatUnits(await ethers.provider.getGasPrice(), 'gwei')} gwei`)

      const expandedArgs = params.args.map((f) => f())
      console.log(`Deploying ${getName(params.name)} ${params.contract} with ${expandedArgs}`)

      const gasEstimate = await deployerAcc.estimateGas(contractFactory.getDeployTransaction(...expandedArgs))
      console.log(`Estimated gas: ${gasEstimate}`)

      deployed = await contractFactory.deploy(...expandedArgs)

      await deployed.deployed()
      console.log(`${getName(params.name)} ${params.contract} deployed at ${deployed.address}`)

      const addressMap = readAddressMappingIfExists(params.addressFile)
      addressMap.set(params.name, deployed.address)
      writeAddressMap(params.addressFile, addressMap)

      const deployerAddressMap = readAddressMappingIfExists('deployers.json')
      deployerAddressMap.set(deployed.address, deployerAcc.address)
      writeAddressMap('deployers.json', deployerAddressMap)

      verify(params.name, deployed, expandedArgs, params.libs)

      // Give ROOT to the Timelock only if we haven't done so yet, and only if the contract inherits AccessControl
      if (deployed.interface.functions['ROOT()'] && !(await deployed.hasRole(ROOT, timelock.address))) {
        await (await deployed.grantRole(ROOT, timelock.address)).wait(1)
        console.log(`${getName(params.name)}.grantRoles(ROOT, timelock)`)
      }
    } else {
      console.log(`Reusing ${getName(params.name)} ${params.contract} at: ${deployedAddress}`)
    }
  }
})()
