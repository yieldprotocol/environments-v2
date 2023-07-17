import *  as fs from 'fs'
import * as path from 'path'

import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@typechain/hardhat'

import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

// uncomment this to verify Tenderly contracts
import * as tdly from "@tenderly/hardhat-tenderly";
tdly.setup();

import "./augmentations"

function infuraNodeUrl(network: any) {
  let infuraKey
  try {
    infuraKey = fs.readFileSync(path.resolve(__dirname, '.infuraKey')).toString().trim()
  } catch (e) {
    infuraKey = ''
  }
  return `https://${network}.infura.io/v3/${infuraKey}`
}

function alchemyNodeUrl(network: any) {
  let alchemyKey
  try {
    alchemyKey = fs.readFileSync(path.resolve(__dirname, '.alchemyKey')).toString().trim()
  } catch (e) {
    alchemyKey = ''
  }
  return `https://eth-${network}.alchemyapi.io/v2/${alchemyKey}`
}


function arbNodeUrl(network: string) {
  switch (network) {
    // case "rinkeby": return "https://rinkeby.arbitrum.io/rpc";
    case "mainnet": return "https://arb1.arbitrum.io/rpc";
  }
  throw new Error(`Unknown arbitrum network ${network}`);
}

let mnemonic = process.env.MNEMONIC
if (!mnemonic) {
  try {
    mnemonic = fs.readFileSync(path.resolve(__dirname, '.secret')).toString().trim()
  } catch (e) { }
}
const accounts = mnemonic ? {
  mnemonic,
} : undefined

let etherscanKey = process.env.ETHERSCANKEY
if (!etherscanKey) {
  try {
    etherscanKey = fs.readFileSync(path.resolve(__dirname, '.etherscanKey')).toString().trim()
  } catch (e) { }
}

let arbiscanKey = process.env.ARBISCANKEY
if (!arbiscanKey) {
  try {
    arbiscanKey = fs.readFileSync(path.resolve(__dirname, '.arbiscanKey')).toString().trim()
  } catch (e) { }
}

module.exports = {
  solidity: {
    version: '0.8.15',
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      }
    }
  },
  abiExporter: {
    path: './abis',
    clear: true,
    flat: true,
    // only: [':ERC20$'],
    spacing: 2
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  gasReporter: {
    enabled: true,
  },
  defaultNetwork: 'hardhat',
  namedAccounts: {
    deployer: 0,
    owner: 1,
    other: 2,
  },
  networks: {
    hardhat: {
      accounts,
      chainId: 31337,
      blockGasLimit: 300_000_000,
      loggingEnabled: true,
    },
    localhost: {
      timeout: 600000,
      chainId: 42161,  // hardhat node used 31337 for local host but anvil uses the actual chainid
      loggingEnabled: true,
    },
    tenderly: {
      // update url of fork
      url: "https://rpc.tenderly.co/fork/08a8b5cd-268d-45a3-9a3c-c5174db794f3",
      // update chainId if necessary
      forkNetwork: "1",
      username: "Yield",
      project: "v2",
      timeout: 60_000_000,
      gasPrice: 1_000_000_000
    },
    mainnet: {
      accounts,
      blockGasLimit: 300_000_000_000,
      gasPrice: 20_000_000_000,
      timeout: 60_000_000,
      gasMultiplier: 1.2,
      url: infuraNodeUrl('mainnet')
    },
    arb_mainnet: {
      accounts,
      url: arbNodeUrl('mainnet'),
      chainId: 42161,
      timeout: 60000
    },
    coverage: {
      url: 'http://127.0.0.1:8555',
    },
  },
  tenderly: {
		username: "Yield",
		project: "v2",
    forkNetwork: "1",
	},
  etherscan: {
    apiKey: {
      mainnet: etherscanKey,
      arbitrumOne: arbiscanKey
    }
  }
}