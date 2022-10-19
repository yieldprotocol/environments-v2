import { ethers, network } from 'hardhat'

import * as hre from 'hardhat'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { BigNumber, ContractTransaction, BaseContract } from 'ethers'
import { BaseProvider } from '@ethersproject/providers'
import { Timelock } from '../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

/// --------- PROPOSAL EXECUTION ---------

/** @dev Check if address is a deployed contract */
export const addressHasCode = async (address: string, label = 'unknown') => {
  const code = await ethers.provider.getCode(address)
  if (code === '0x') throw new Error(`Address: ${address} has no code. Label: ${label}`)
}

export const enum ProposalState {
  Unknown = 0,
  Proposed = 1,
  Approved = 2,
}

export const awaitAndRequireProposal =
  (timelock: Timelock, txHash: string, requiredConfirmations: number) =>
  async (tx: ContractTransaction, state: ProposalState) => {
    await tx.wait(requiredConfirmations)
    const proposalState = (await timelock.proposals(txHash)).state
    if (!(proposalState === state)) {
      throw new Error(`Proposal is in incorrect state. Expected: ${state} but got: ${proposalState}`)
    }
  }

/** @dev Propose on the timelock */
export const propose = async (
  timelock: Timelock,
  proposal: Array<{ target: string; data: string }>,
  developer?: string
) => {
  const signerAcc = await getOwnerOrImpersonate(developer as string, BigNumber.from('1000000000000000000'))
  const proposalHash = await timelock.hash(proposal)
  console.log(`Proposal: ${proposalHash}`)

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, proposalHash, requiredConfirmations)

  if ((await timelock.proposals(proposalHash)).state === ProposalState.Unknown) {
    console.log('Proposing')
    console.log(`Developer: ${signerAcc.address}\n`)
    console.log(`Calldata:\n${timelock.interface.encodeFunctionData('propose', [proposal])}`)

    writeProposal(proposalHash, timelock.interface.encodeFunctionData('execute', [proposal]))

    const tx = await timelock.connect(signerAcc).propose(proposal)
    await requireProposalState(tx, ProposalState.Proposed)
    console.log(`Proposed ${proposalHash}`)
  }
}

/// --------- FORKS ---------

/** @dev Check if we are in a fork */
export const isFork = () => {
  return network.name === 'localhost' || network.name.includes('tenderly')
}

/** @dev Impersonate an account and optionally add some ether to it. Works for hardhat or tenderly. */
export const impersonate = async (account: string, balance?: BigNumber) => {
  if (network.name.includes('localhost')) {
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [account],
    })
  }

  if (balance !== undefined) {
    await hre.network.provider.request({
      method: hre.network.name.includes('tenderly') ? 'tenderly_setBalance' : 'hardhat_setBalance',
      params: [account, ethers.utils.parseEther(balance.toString()).toHexString()],
    })
  }

  console.log(`Impersonated ${account}`)
  return await ethers.getSigner(account)
}

/** @dev Get the first account or, if we are in a fork, impersonate the one at the address passed on as a parameter */
export const getOwnerOrImpersonate = async (
  impersonatedAddress: string,
  balance?: BigNumber
): Promise<SignerWithAddress> => {
  return isFork() ? await impersonate(impersonatedAddress, balance) : (await ethers.getSigners())[0]
}

/** @dev Advance time by a number of seconds */
export const advanceTime = async (time: number) => {
  if (time > 0) {
    if (hre.network.name.includes('tenderly')) {
      await network.provider.send('evm_increaseTime', [ethers.utils.hexValue(time)])
      await network.provider.send('evm_increaseBlocks', [ethers.utils.hexValue(1)])
    } else {
      await network.provider.send('evm_increaseTime', [time])
      await network.provider.send('evm_mine', [])
    }
    console.log(`advancing time by ${time} seconds (${time / (24 * 60 * 60)} days)`)
  }
}

/** @dev Advance time to a given second in unix time */
export const advanceTimeTo = async (time: number) => {
  const provider: BaseProvider = ethers.provider
  const now = (await provider.getBlock(await provider.getBlockNumber())).timestamp
  await advanceTime(time - now)
}

/// --------- DATA MANIPULATION ---------

export function bytesToString(bytes: string): string {
  return ethers.utils.parseBytes32String(bytes + '0'.repeat(66 - bytes.length))
}

export function stringToBytes(str: string, bytes?: number) {
  if (bytes == undefined) bytes = str.length
  return ethers.utils.formatBytes32String(str).slice(0, 2 + bytes * 2)
}

export function stringToBytes6(x: string): string {
  return ethers.utils.formatBytes32String(x).slice(0, 14)
}

export function stringToBytes32(x: string): string {
  return ethers.utils.formatBytes32String(x)
}

export function bytesToBytes32(bytes: string): string {
  return stringToBytes32(bytesToString(bytes))
}

export function flattenContractMap(map: Map<string, any>): Map<string, string> {
  const flat = new Map<string, string>()
  map.forEach((value: any, key: string) => {
    flat.set(key, value.address !== undefined ? value.address : value)
  })
  return flat
}

/* MAP to Json for file export */
export function mapToJson(map: Map<any, any>): string {
  return JSON.stringify(
    flattenContractMap(map),
    /* replacer */
    (key: any, value: any) => {
      if (value instanceof Map) {
        return {
          dataType: 'Map',
          value: [...value],
        }
      } else {
        return value
      }
    },
    2
  )
}

export function jsonToMap(json: string): Map<any, any> {
  return JSON.parse(
    json,
    /* revivor */
    (key: any, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
          return new Map(value.value)
        }
      }
      return value
    }
  )
}

export function writeProposal(proposalHash: string, proposalExecute: string) {
  if (!existsSync('./tmp/')) {
    mkdirSync('./tmp')
  }
  writeFileSync('./tmp/proposal.txt', `${proposalHash} ${proposalExecute}`)
}

export function readProposal(): string[] {
  return readFileSync('./tmp/proposal.txt', 'utf8').split(' ')
}

/// --------- ADDRESS FILES ---------

/**
 * Return path to network-specific address mapping file
 * 'government.json' can be resolved to 'addresses/kovan/government.json', for example
 */
export function getNetworkFilePath(file_name: string): string {
  const full_path = join('addresses', network.name, file_name)
  // console.log("full_path", full_path)
  if (!existsSync(dirname(full_path))) {
    console.log(`Directory for ${full_path} doesn't exist, creating it`)
    mkdirSync(dirname(full_path))
  }
  return full_path
}

/**
 * Read Map<string, string> from network-specific file
 * If the file does not exist, empty map is returned
 */
export function readAddressMappingIfExists(file_name: string): Map<string, string> {
  const full_path = getNetworkFilePath(file_name)
  if (existsSync(full_path)) {
    return jsonToMap(readFileSync(full_path, 'utf8'))
  }
  return new Map<string, string>()
}

export function writeAddressMap(out_file: string, map_or_dictionary: Record<string, any> | Map<any, any>) {
  let map = readAddressMappingIfExists(out_file)
  if (map_or_dictionary instanceof Map) {
    map = new Map([...map, ...map_or_dictionary])
  } else {
    for (let k in map_or_dictionary) {
      map.set(k, map_or_dictionary[k])
    }
  }
  writeFileSync(getNetworkFilePath(out_file), mapToJson(map), 'utf8')
}

export function writeVerificationHelper(contract: string, address: string) {
  writeFileSync(getNetworkFilePath(`${contract}.js`), `module.exports = { ${contract}: "${address}" }`)
}

/// --------- CONTRACT VERIFICATION ---------

export function verify(name: string, contract: BaseContract, args: any, libs?: any) {
  const libsargs = libs !== undefined ? `--libraries ${libs.toString()}` : ''
  if (network.name == 'localhost') return
  else if (network.name == 'tenderly') tenderlyVerify(name, contract)
  else console.log(`npx hardhat verify --network ${network.name} ${contract.address} ${args.join(' ')} ${libsargs}`)
}

export const tenderlyVerify = async (name: string, contract: BaseContract) => {
  if (network.name === 'tenderly') {
    await hre.tenderly.persistArtifacts({
      name,
      address: contract.address,
    })

    await hre.tenderly.verify({
      name,
      address: contract.address,
    })
  }
}
