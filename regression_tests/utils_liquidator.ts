import { exec as exec_async } from 'child_process'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { createInterface } from 'readline'
import { Readable } from 'stream'
import { promisify } from 'util'

import { normalizeHardhatNetworkAccountsConfig } from 'hardhat/internal/core/providers/util'
import { HardhatNetworkAccountsConfig } from 'hardhat/types/config'
import { subtask } from 'hardhat/config'
import { config, network, run } from 'hardhat'

import { Logger } from 'tslog'

const exec = promisify(exec_async)
const logger: Logger = new Logger()

export class LiquidatorConfig {
  constructor(
    readonly multicall2: string,
    readonly liquidator: string,
    readonly witch: string,
    readonly swap_router_v2: string,
    readonly chain_id: number,
    readonly port: number
  ) {}
}

export class TestFixture {
  private_key: string = ''
  tmp_root: string = ''
  chain_id: number = -1
}

export async function run_liquidator(
  fixture: TestFixture,
  config: LiquidatorConfig,
  base_to_debt_threshold: { [name: string]: string } = {}
) {
  const config_path = join(fixture.tmp_root, 'config.json')
  await fs.writeFile(
    config_path,
    JSON.stringify(
      {
        Witch: config.witch,
        Flash: config.liquidator,
        Multicall2: config.multicall2,
        BaseToDebtThreshold: base_to_debt_threshold,
        SwapRouter02: config.swap_router_v2,
      },
      undefined,
      2
    )
  )

  const private_key_path = join(fixture.tmp_root, 'private_key')
  await fs.writeFile(private_key_path, fixture.private_key)
  const cmd = `cargo run -- -c ${config_path} -u http://127.0.0.1:${config.port}/ -C ${config.chain_id} \
        -p ${private_key_path} \
        --gas-boost 10 \
        --swap-router-binary build/bin/router \
        --one-shot \
        --json-log \
        --file /dev/null`

  let stdout: string
  let stderr: string
  try {
    const results = await exec(cmd, {
      cwd: 'modules/liquidator',
      encoding: 'utf-8',
      env: {
        RUST_BACKTRACE: '1',
        RUST_LOG: 'liquidator,yield_liquidator=debug',
        ...process.env,
      },
      maxBuffer: 1024 * 1024 * 10,
    })
    stdout = results.stdout
    stderr = results.stderr
  } catch (x) {
    logger.warn('Failed to run the liquidator: ', x)
    stdout = (x as any).stdout
    stderr = (x as any).stderr
  }
  await fs.writeFile(join(fixture.tmp_root, 'stdout'), stdout)
  await fs.writeFile(join(fixture.tmp_root, 'stderr'), stderr)
  logger.info('tmp root', fixture.tmp_root)

  const rl = createInterface({
    input: Readable.from(stdout),
    crlfDelay: Infinity,
  })

  const ret = new Array<any>()
  for await (const line of rl) {
    ret.push(JSON.parse(line))
  }
  return ret
}

export async function testSetUp(self: Mocha.Suite, http_port: number, fixture: TestFixture) {
  self.beforeAll(async function () {
    if (fixture.chain_id != -1) {
      config.networks[network.name].chainId = fixture.chain_id
    }
    const accounts = normalizeHardhatNetworkAccountsConfig(
      config.networks[network.name].accounts as HardhatNetworkAccountsConfig
    )

    fixture.private_key = accounts[0].privateKey.slice(2)

    return new Promise((resolve, fail) => {
      run('node', { silent: true, port: http_port })

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
  self.beforeEach(async function () {
    fixture.tmp_root = await fs.mkdtemp(join(tmpdir(), 'flash_liquidator_test'))
  })
}

export async function deployETHSeries(fixture: TestFixture) {
  const cmd = `./scripts/governance/addSeries/addEthSeries/addEthSeries.sh`
  let stdout: string
  let stderr: string
  try {
    const results = await exec(cmd, {
      maxBuffer: 1024 * 1024 * 10,
    })
    stdout = results.stdout
    stderr = results.stderr
  } catch (x) {
    logger.warn('Failed to deploy the series: ', x)
    stdout = (x as any).stdout
    stderr = (x as any).stderr
  }
  await fs.writeFile(join(fixture.tmp_root, 'stdout'), stdout)
  await fs.writeFile(join(fixture.tmp_root, 'stderr'), stderr)
  logger.info('tmp root', fixture.tmp_root)
}
