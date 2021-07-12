import *  as fs from 'fs'
import * as path from 'path'

import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-gas-reporter'
import 'hardhat-typechain'
import 'solidity-coverage'
import 'hardhat-deploy'
import { task } from 'hardhat/config'

import { addBase, addIlk } from './environments/add'

// REQUIRED TO ENSURE METADATA IS SAVED IN DEPLOYMENTS (because solidity-coverage disable it otherwise)
/* import {
  TASK_COMPILE_GET_COMPILER_INPUT
} from "hardhat/builtin-tasks/task-names"
task(TASK_COMPILE_GET_COMPILER_INPUT).setAction(async (_, bre, runSuper) => {
  const input = await runSuper()
  input.settings.metadata.useLiteralContent = bre.network.name !== "coverage"
  return input
}) */

task("add", "Adds an asset as an ilk or a base to an existing protocol deployment")
  .addFlag("base", "Add asset as base")
  .addFlag("ilk", "Add asset as ilk")
  .addVariadicPositionalParam("asset", "The details of the asset")
  .setAction(async (taskArgs, hre) => {
    const argv: any = {}
    if (taskArgs.base && taskArgs.ilk) {
      console.error("Must add asset as either base or ilk")
    } else if (taskArgs.base) {
      argv.asset = taskArgs.asset[0]
      argv.maturity = taskArgs.asset[1]
      argv.sources = []
      argv.counters = []
      taskArgs.asset.slice(4).forEach((a: any, i: any) => { i % 2 ? argv.counters.push(a) : argv.sources.push(a) })
      await addIlk(argv, hre)
      argv.sources.unshift(taskArgs.asset[2]) // rate source
      argv.sources.unshift(taskArgs.asset[3]) // chi source
      await addBase(argv, hre)
    } else if (taskArgs.ilk) {
      argv.asset = taskArgs.asset[0]
      argv.sources = []
      argv.counters = []
      taskArgs.asset.slice(1).forEach((a: any, i: any) => { i % 2 ? argv.counters.push(a) : argv.sources.push(a) })
      await addIlk(argv, hre)
    } else {
      console.error("Must add asset as either base or ilk")
    }
});

function nodeUrl(network: any) {
  let infuraKey
  try {
    infuraKey = fs.readFileSync(path.resolve(__dirname, '.infuraKey')).toString().trim()
  } catch(e) {
    infuraKey = ''
  }
  return `https://${network}.infura.io/v3/${infuraKey}`
}

let mnemonic = process.env.MNEMONIC
if (!mnemonic) {
  try {
    mnemonic = fs.readFileSync(path.resolve(__dirname, '.secret')).toString().trim()
  } catch(e){}
}
const accounts = mnemonic ? {
  mnemonic,
}: undefined

let etherscanKey = process.env.ETHERSCANKEY
if (!etherscanKey) {
  try {
    etherscanKey = fs.readFileSync(path.resolve(__dirname, '.etherscanKey')).toString().trim()
  } catch(e){}
}

module.exports = {
  solidity: {
    version: '0.8.1',
    settings: {
      optimizer: {
        enabled: true,
        runs: 5000,
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
      chainId: 31337
    },
    localhost: {
      chainId: 31337
    },
    kovan: {
      accounts,
      gasPrice: 10000000000,
      url: nodeUrl('kovan')
    },
    goerli: {
      accounts,
      url: nodeUrl('goerli'),
    },
    rinkeby: {
      accounts,
      url: nodeUrl('rinkeby')
    },
    ropsten: {
      accounts,
      url: nodeUrl('ropsten')
    },
    mainnet: {
      accounts,
      url: nodeUrl('mainnet')
    },
    coverage: {
      url: 'http://127.0.0.1:8555',
    },
  },
  etherscan: {
    apiKey: etherscanKey
  },
}
