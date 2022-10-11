import { ethers, network, waffle } from 'hardhat'
import * as fs from 'fs'
import * as hre from 'hardhat'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { BigNumber, ContractTransaction, BaseContract } from 'ethers'
import { BaseProvider } from '@ethersproject/providers'
import { THREE_MONTHS, ROOT } from './constants'
import { AccessControl, Timelock } from '../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const paths = new Map([
  [1, './addresses/mainnet/'],
  [4, './addresses/rinkeby/'],
  [42, './addresses/kovan/'],
])

/** @dev Determines chainId and retrieves address mappings from governance and protocol json files*/
/** returns a 2 element array of Map's for **governance** and **protocol**, with contract names mapped to addresses */
export const getGovernanceProtocolAddresses = async (chainId: number): Promise<Map<string, string>[]> => {
  if (!paths.get(chainId)) throw `Chain id ${chainId} not found. Only Rinkeby, Kovan and Mainnet supported`
  const path = paths.get(chainId)
  const governance = jsonToMap(fs.readFileSync(`${path}governance.json`, 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync(`${path}protocol.json`, 'utf8')) as Map<string, string>
  return [governance, protocol]
}

/** @dev Get the chain id, even after forking. This works because WETH10 was deployed at the same
 * address in all networks, and recorded its chainId at deployment */
export const getOriginalChainId = async (): Promise<number> => {
  const ABI = ['function deploymentChainId() view returns (uint256)']
  const weth10Address = '0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F'
  const weth10 = new ethers.Contract(weth10Address, ABI, ethers.provider)
  let chainId
  if ((await ethers.provider.getCode(weth10Address)) === '0x') {
    chainId = 31337 // local or unknown network
  } else {
    chainId = (await weth10.deploymentChainId()).toNumber()
  }
  console.log(`ChainId: ${chainId}`)
  return chainId
}

/** @dev Check if address is a deployed contract */
export const addressHasCode = async (address: string, label = 'unknown') => {
  const code = await ethers.provider.getCode(address)
  if (code === '0x') throw new Error(`Address: ${address} has no code. Label: ${label}`)
}

/** @dev Get the first account or, if we are in a fork, impersonate the one at the address passed on as a parameter */
export const getOwnerOrImpersonate = async (impersonatedAddress: string, balance?: BigNumber) => {
  if (network.name.includes('tenderly')) {
    console.log(`Impersonating ${impersonatedAddress} on Tenderly`)
    if (balance) {
      await network.provider.send('tenderly_addBalance', [
        impersonatedAddress,
        ethers.utils.parseEther('1000').toHexString(),
      ])
    }
    return await ethers.getSigner(impersonatedAddress)
  }
  let [ownerAcc] = await ethers.getSigners()
  const on_fork = ownerAcc.address === '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  if (on_fork) {
    console.log(`Impersonating ${impersonatedAddress} on localhost`)
    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [impersonatedAddress],
    })
    ownerAcc = await ethers.getSigner(impersonatedAddress)

    // Get some Ether while we are at it
    await hre.network.provider.request({
      method: 'hardhat_setBalance',
      params: [impersonatedAddress, '0x1000000000000000000000000'],
    })
  }
  return ownerAcc
}

/** @dev Impersonate an account and optionally add some ether to it. Works for hardhat or tenderly. */
export const impersonate = async (account: string, balance?: BigNumber) => {
  if (!network.name.includes('tenderly')) {
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

const isFork = () => {
  return network.name === 'localhost' || network.name.includes('tenderly')
}

const enum ProposalState {
  Unknown = 0,
  Proposed = 1,
  Approved = 2,
}

const awaitAndRequireProposal =
  (timelock: Timelock, txHash: string, requiredConfirmations: number) =>
  async (tx: ContractTransaction, state: ProposalState) => {
    await tx.wait(requiredConfirmations)
    const proposalState = (await timelock.proposals(txHash)).state
    if (!(proposalState === state)) {
      throw new Error(`Proposal is in incorrect state. Expected: ${state} but got: ${proposalState}`)
    }
  }

/** @dev Advance time to a given second in unix time */
export const advanceTimeTo = async (time: number) => {
  const provider: BaseProvider = ethers.provider
  const now = (await provider.getBlock(await provider.getBlockNumber())).timestamp
  await advanceTime(time - now)
}

/**
 * @dev Given a timelock contract and a proposal hash, propose it, approve it or execute it,
 * depending on the proposal state in the timelock.
 * If approving a proposal and on a fork, impersonate the multisig address passed on as a parameter.
 */
export const proposeApproveExecute = async (
  timelock: Timelock,
  proposal: Array<{ target: string; data: string }>,
  multisig?: string,
  developer?: string
) => {
  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, txHash, requiredConfirmations)

  // Depending on the proposal state:
  // - propose
  // - approve (if in a fork, impersonating the multisig, and advancing time three days afterwards)
  // - or execute
  if ((await timelock.proposals(txHash)).state === 0) {
    console.log('Proposing')
    // Propose
    let signerAcc
    if (developer) {
      if (network.name === 'localhost' || network.name.includes('tenderly')) {
        signerAcc = await impersonate(developer as string, BigNumber.from('1000000000000000000'))
      } else {
        signerAcc = await ethers.getSigner(developer)
      }
    } else {
      ;[signerAcc] = await ethers.getSigners()
    }
    console.log(`Developer: ${signerAcc.address}\n`)
    console.log(`Calldata:\n${timelock.interface.encodeFunctionData('propose', [proposal])}`)
    const gasEstimate = await timelock.connect(signerAcc).estimateGas.propose(proposal)
    const ethBalance = await signerAcc.getBalance()
    console.log(`gasEstimate: ${gasEstimate} - ethBalance: ${ethBalance}`)
    const tx = await timelock.connect(signerAcc).propose(proposal)
    await requireProposalState(tx, ProposalState.Proposed)
    console.log(`Proposed ${txHash}`)
  } else if ((await timelock.proposals(txHash)).state === 1) {
    console.log('Approving')
    let signerAcc: SignerWithAddress
    // Approve, impersonating multisig if in a fork
    if (network.name === 'localhost' || network.name.includes('tenderly')) {
      if (multisig === undefined) throw 'Must provide an address with approve permissions to impersonate'
      signerAcc = await impersonate(multisig as string, BigNumber.from('1000000000000000000'))
      // Since we are in a testing environment, let's advance time
      advanceTime(await timelock.delay())
    } else {
      // On kovan we have approval permissions
      signerAcc = (await ethers.getSigners())[0]
    }
    const tx = await timelock.connect(signerAcc).approve(txHash)
    await requireProposalState(tx, ProposalState.Approved)
    console.log(`Approved ${txHash}`)
  } else if ((await timelock.proposals(txHash)).state === ProposalState.Approved) {
    console.log('Executing')
    // Execute
    let signerAcc
    if (developer) {
      if (network.name === 'localhost' || network.name.includes('tenderly')) {
        signerAcc = await impersonate(developer as string, BigNumber.from('1000000000000000000'))
      } else {
        signerAcc = await ethers.getSigner(developer)
      }
    } else {
      ;[signerAcc] = await ethers.getSigners()
    }
    const tx = await timelock.connect(signerAcc).execute(proposal)
    await requireProposalState(tx, ProposalState.Unknown)
    console.log(`Executed ${txHash}`)
  }
}

export const transferFromFunder = async (
  tokenAddress: string,
  recipientAddress: string,
  amount: BigNumber,
  funderAddress: string
) => {
  const tokenContract = await ethers.getContractAt('ERC20', tokenAddress)
  const tokenSymbol = await tokenContract.symbol()
  try {
    console.log(
      `Attempting to move ${ethers.utils.formatEther(
        amount
      )} ${tokenSymbol} from whale account ${funderAddress} to account ${recipientAddress}`
    )
    /* if using whaleTransfer, impersonate that account, and transfer token from it */
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [funderAddress],
    })
    const _signer = await ethers.provider.getSigner(funderAddress)
    const _tokenContract = await ethers.getContractAt('ERC20', tokenAddress, _signer)
    await _tokenContract.transfer(recipientAddress, amount)
    console.log('Transfer Successful.')

    await network.provider.request({
      method: 'hardhat_stopImpersonatingAccount',
      params: [funderAddress],
    })
  } catch (e) {
    console.log(
      `Warning: Failed transferring ${tokenSymbol} from whale account. Some protocol features related to this token may not work`,
      e
    )
  }
}

export const generateMaturities = async (n: number) => {
  const provider: BaseProvider = await ethers.provider
  const now = (await provider.getBlock(await provider.getBlockNumber())).timestamp
  let count: number = 1
  const maturities = Array.from({ length: n }, () => now + THREE_MONTHS * count++)
  return maturities
}

export const fundExternalAccounts = async (assetList: Map<string, any>, accountList: Array<string>) => {
  const [ownerAcc] = await ethers.getSigners()
  await Promise.all(
    accountList.map((to: string) => {
      /* add test Eth */
      ownerAcc.sendTransaction({ to, value: ethers.utils.parseEther('100') })
      /* add test asset[] values (if not ETH) */
      assetList.forEach(async (value: any, key: any) => {
        if (key !== '0x455448000000') {
          await value.transfer(to, ethers.utils.parseEther('1000'))
        }
      })
    })
  )
  console.log('External test accounts funded with 100ETH, and 1000 of each asset')
}

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

export function verify(address: string, args: any, libs?: any) {
  const libsargs = libs !== undefined ? `--libraries ${libs.toString()}` : ''
  console.log(`npx hardhat verify --network ${network.name} ${address} ${args.join(' ')} ${libsargs}`)
  /* if (network.name !== 'localhost') {
    run("verify:verify", {
      address: address,
      constructorArguments: args,
      libraries: libs,
    })
  } */
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

export function writeVerificationHelper(contract: string, address: string) {
  writeFileSync(join('addresses', getNetworkName(), `${contract}.js`), `module.exports = { ${contract}: "${address}" }`)
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
  writeFileSync(getAddressMappingFilePath(out_file), mapToJson(map), 'utf8')
}

export function flattenContractMap(map: Map<string, any>): Map<string, string> {
  const flat = new Map<string, string>()
  map.forEach((value: any, key: string) => {
    flat.set(key, value.address !== undefined ? value.address : value)
  })
  return flat
}

export function toAddress(obj: any): string {
  return obj.address !== undefined ? obj.address : obj
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

export function getNetworkName(): string {
  return network.name
}

/**
 * Return path to network-specific address mapping file
 * 'government.json' can be resolved to 'addresses/kovan/government.json', for example
 */
export function getAddressMappingFilePath(file_name: string): string {
  const full_path = join('addresses', getNetworkName(), file_name)
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
  const full_path = getAddressMappingFilePath(file_name)
  if (existsSync(full_path)) {
    return jsonToMap(readFileSync(full_path, 'utf8'))
  }
  return new Map<string, string>()
}

/**
 * Deploy a contract and verify it
 * Just a type-safe wrapper to deploy/log/verify a contract
 */
export async function deploy<OutT>(owner: any, artifact: any, constructor_args: any[]) {
  const ret = (await waffle.deployContract(owner, artifact, constructor_args)) as unknown as OutT
  console.log(`[${artifact.contractName}, '${(ret as any).address}']`)
  verify((ret as any).address, constructor_args)
  return ret
}

/**
 * Type-safe wrapper around ethers.getContractAt: return deployed instance of a contract
 */
export async function getContract<OutT>(owner: any, name: string, address: string | undefined): Promise<OutT> {
  if (address == undefined) {
    throw new Error(`null address for ${name}`)
  }
  return (await ethers.getContractAt(name, address, owner)) as unknown as OutT
}

/**
 * Make sure Timelock has ROOT access to the contract
 */
export async function ensureRootAccess(contract: AccessControl, timelock: Timelock) {
  if (!(await contract.hasRole(ROOT, timelock.address))) {
    await contract.grantRole(ROOT, timelock.address)
    console.log(`${contract.address}.grantRoles(ROOT, timelock)`)
    while (!(await contract.hasRole(ROOT, timelock.address))) {}
  }
}

/**
 * Get an instance of the contract from the mapping file
 * If the contract is not registered there, deploy, register and return it
 */
export async function getOrDeploy<OutT extends AccessControl>(
  owner: any,
  mapping_file: string,
  key: string,
  contractName: string,
  constructor_args: any[],
  timelock: Timelock
): Promise<OutT> {
  const mapping = readAddressMappingIfExists(mapping_file)

  let ret: OutT
  if (mapping.get(key) === undefined) {
    ret = await deploy<OutT>(owner, await hre.artifacts.readArtifact(contractName), constructor_args)
    mapping.set(key, ret.address)
    writeAddressMap(mapping_file, mapping)
  } else {
    ret = await getContract<OutT>(owner, contractName, mapping.get(key))
  }
  await ensureRootAccess(ret, timelock)
  return ret
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
