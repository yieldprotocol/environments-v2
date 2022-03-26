import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { FlashLiquidator, FlashLiquidator__factory } from '../typechain'

import { expect } from 'chai'
import { config, ethers, network, run } from 'hardhat'
import { subtask } from 'hardhat/config'
import { normalizeHardhatNetworkAccountsConfig } from 'hardhat/internal/core/providers/util'

import { Logger } from 'tslog'

import { Readable } from 'stream'
import { createInterface } from 'readline'
// import { readFile, mkdtemp, writeFile } from "fs/promises";
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { execute } from './utils'

const logger: Logger = new Logger()

async function fork(block_number?: number) {
  const alchemy_key = (await fs.readFile(join(__dirname, '..', '.alchemyKey'))).toString().trim()

  await network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${alchemy_key}`,
          blockNumber: block_number,
        },
      },
    ],
  })
}

describe('new environment', function () {
  let tmp_root: string

  this.beforeAll(async function () {
    return new Promise((resolve, fail) => {
      run('node', { silent: true, port: 8545 })
      // launch hardhat node so that external processes can access it
      subtask('node:server-ready', async function (args, _hre, runSuper) {
        try {
          await runSuper(args)
          logger.info('node launched')
          resolve()
        } catch {
          fail()
        }
      })
    })
  })
  this.beforeEach(async function () {
    tmp_root = await fs.mkdtemp(join(tmpdir(), 'deployooor_test'))
  })

  it('can be created', async function () {
    this.timeout(900e3)

    await fork()

    const { stdout, stderr, error } = await execute('scripts/governance/newEnvironment/newEnvironment-common.sh')
    expect(error).to.be.undefined
  })
})
