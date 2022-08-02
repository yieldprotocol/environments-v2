import *  as fs from 'fs'
import * as path from 'path'

import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import '@typechain/hardhat'

import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import 'solidity-coverage'

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
    case "rinkeby": return "https://rinkeby.arbitrum.io/rpc";
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

module.exports = {
  solidity: {
    version: '0.8.14',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
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
      // chainId: 31337,
      timeout: 600000
    },
    ropsten: {
      accounts,
      url: infuraNodeUrl('ropsten')
    },
    goerli: {
      accounts,
      gasPrice: 1000000000,
      timeout: 600000,
      url: infuraNodeUrl('goerli'),
    },
    kovan: {
      accounts,
      gasPrice: 1000000000,
      timeout: 600000,
      url: infuraNodeUrl('kovan')
    },
    rinkeby: {
      accounts,
      gasPrice: 2000000000,
      gasMultiplier: 1.1,
      timeout: 600000,
      url: alchemyNodeUrl('rinkeby')
    },
    tenderly: {
      accounts,
      gasPrice: 2000000000,
      gasMultiplier: 1.1,
      timeout: 600000,
      url: 'https://rpc.tenderly.co/fork/d8a5dfd6-d879-4a3f-bbf6-e5b967da3031'
    },
    arb_rinkeby: {
      accounts,
      url: arbNodeUrl('rinkeby'),
      gasPrice: 3000000000,
      chainId: 421611,
      timeout: 60000
    },
    mainnet: {
      accounts,
      gasPrice: 20000000000,
      gasMultiplier: 1.1,
      timeout: 60000000,
      url: infuraNodeUrl('mainnet')
    },
    arb_mainnet: {
      accounts,
      url: arbNodeUrl('mainnet'),
      gasPrice: 500000000,
      chainId: 42161,
      timeout: 60000
    },
    coverage: {
      url: 'http://127.0.0.1:8555',
    },
  },
  etherscan: {
    apiKey: etherscanKey
  },
}