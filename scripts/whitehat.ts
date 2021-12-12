// impersonate dude
// dsproxy = get dsproxy ctrct
// do an execute to the WETH9 address, converting everthing
// do an exectute to our ladle -- exitWeth
import { ethers, waffle } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { getOriginalChainId, getOwnerOrImpersonate, jsonToMap } from '../../../shared/helpers'
import { readFileSync } from 'fs'
import { DSProxy, Transfer } from '../../../typechain'
import TransferArtifact from '../../../artifacts/contracts/dsproxy/Transfer.sol/Transfer.json'
const { deployContract } = waffle

/**
 * @dev This script gives developer privileges to an account.
 */
;(async () => {
  const proxyOwner: string = '0xd1d6e624f13bbe3d59e6cd43d7408a7c51c8c033'
  const rescueeAddress: string = '0x5eea118e75f247014c6d0e990f02a0c254edc852'
  const dsproxyAddress: string = '0x519125ED7409c4b8b8352908ca841183Dfe0A5b6'
  const chainId = await getOriginalChainId()
  if (chainId !== 1) throw 'This is a mainnet operation'
  const protocol = jsonToMap(fs.readFileSync('./addresses/mainnet/protocol.json', 'utf8')) as Map<string, string>

  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [proxyOwner],
  })
  await hre.network.provider.request({
    method: 'hardhat_setBalance',
    params: [proxyOwner, '0x1000000000000000000000'],
  })

  const proxyOwnerAcc = await ethers.getSigner(proxyOwner)

  const dsproxy = (await ethers.getContractAt('DSProxy', dsproxyAddress, proxyOwnerAcc)) as DSProxy

  const transfer = (await deployContract(proxyOwnerAcc, TransferArtifact)) as Transfer
  console.log(`Transfer deployed at ${transfer.address}`)
  // const transferAddress = '0x9B41aDE83e10e7d0A190f419Aaf9dbdD9091839d'
  // const transfer = (await ethers.getContractAt('Transfer', transferAddress, proxyOwnerAcc)) as Transfer

  const provider = ethers.getDefaultProvider('http://127.0.0.1:8545/)')
  let rescueeBalance = await provider.getBalance(rescueeAddress)
  console.log('Rescuee current eth balance:', ethers.utils.formatEther(rescueeBalance))

  console.log("Using DSProxy.execute to call Transfer.transferAllEth")
  const data = transfer.interface.encodeFunctionData('transferAllEth', [rescueeAddress])
  await dsproxy['execute(address,bytes)'](transfer.address, data)
  rescueeBalance = await provider.getBalance(rescueeAddress)
  console.log('Rescuee current eth balance:', ethers.utils.formatEther(rescueeBalance))
})()
