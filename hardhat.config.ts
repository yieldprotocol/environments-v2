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
import { subtask, task } from 'hardhat/config'

import { mkdir, readFile, writeFile, rm } from "fs/promises";
import { dirname, join } from "path";


async function dumpInputs(root: string, inputs: any) {
  const sources = inputs["input"]["sources"];

  for (const file_name_fragment in sources) {
    const file_name = join(root, file_name_fragment);
    await mkdir(dirname(file_name), { recursive: true });
    await writeFile(file_name, sources[file_name_fragment]["content"]);
  }
}

const COMBINED_FILE_NAME = "combined.solc.json";

task("dapp-export")
  .setAction(async function (args, hre, runSuper) {
    const dapp_root = join(hre.config.paths.cache, "dapp");
    // clean
    await rm(dapp_root, { recursive: true });
    await mkdir(dapp_root);
    let files_generated = 0;
    for (const task of ["compile:solidity:solc:run", "compile:solidity:solcjs:run"]) {
      subtask(task).setAction(async function (args, hre, runSuper) {
        const output_file = join(dapp_root, COMBINED_FILE_NAME) + (files_generated > 0 ? `.${files_generated}` : "");

        const output = await runSuper(args);

        await writeFile(output_file, JSON.stringify(output, undefined, 2));
        await dumpInputs(dapp_root, args);

        console.log(`[DAPP-EXPORT]\t${output_file}`);
        files_generated++;
        return output;
      });
    }
    await hre.run("compile", { quiet: true, force: true });
  })

task("dapp-link")
  .addVariadicPositionalParam("libs")
  .addOptionalParam("file", "combined.solc.json file to link", COMBINED_FILE_NAME)
  .setAction(async function (args, hre, runSuper) {
    const library_addresses = new Map(
      (args["libs"] as Array<string>).map(v => {
        const parts = v.split(":");
        if (parts.length != 2) {
          throw new Error(`Bad library format: ${v}`);
        }
        if (parts[1].toLowerCase().startsWith("0x")) {
          parts[1] = parts[1].substr(2);
        }
        if (parts[1].length != 40) {
          throw new Error(`Bad library address length: ${parts[1].length}; expected: 40`);
        }
        return [parts[0], parts[1]];
      })
    )
    const combined_file = join(hre.config.paths.cache, "dapp", args["file"]);
    const combined = JSON.parse(await readFile(combined_file, { encoding: "utf-8" }));
    for (const sol_file of Object.values(combined["contracts"])) {
      for (const contract of Object.values(sol_file as ArrayLike<any>)) {
        for (const bytecode_obj of [(contract as any)["evm"]["deployedBytecode"], (contract as any)["evm"]["bytecode"]]) {
          const refs = bytecode_obj["linkReferences"];
          for (const ref of Object.values(refs)) {
            for (const lib_name in (ref as any)) {
              for (const { length, start } of (ref as any)[lib_name]) {
                if (library_addresses.has(lib_name)) {
                  const bytecode: string = bytecode_obj["object"].slice();
                  bytecode_obj["object"] =
                    bytecode.substr(0, start * 2)
                    + library_addresses.get(lib_name)
                    + bytecode.substr((start + length) * 2);
                  console.log(`Linked ${lib_name}: ${bytecode.substr(start * 2 - 8, length * 2 + 16)} -> ${bytecode_obj["object"].substr(start * 2 - 8, length * 2 + 16)}`)
                } else {
                  throw new Error(`Unknown library: ${lib_name}; known libraries: ${Array.from(library_addresses.keys())}`);
                }
              }
            }
          }
        }
      }
    }
    await writeFile(combined_file, JSON.stringify(combined, undefined, 2));
  })


function nodeUrl(network: any) {
  let infuraKey
  try {
    infuraKey = fs.readFileSync(path.resolve(__dirname, '.infuraKey')).toString().trim()
  } catch (e) {
    infuraKey = ''
  }
  return `https://${network}.infura.io/v3/${infuraKey}`
}

function arbNodeUrl(network: string) {
  switch (network) {
    case "rinkeby": return "https://rinkeby.arbitrum.io/rpc";
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
    version: '0.8.6',
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
      chainId: 31337
    },
    localhost: {
      chainId: 31337,
      timeout: 600000
    },
    kovan: {
      accounts,
      gasPrice: 10000000000,
      timeout: 600000,
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
    arb_rinkeby: {
      accounts,
      url: arbNodeUrl('rinkeby'),
      chainId: 421611,
      timeout: 60000
    },
    ropsten: {
      accounts,
      url: nodeUrl('ropsten')
    },
    mainnet: {
      accounts,
      gasPrice: 80000000000,
      timeout: 60000000,
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