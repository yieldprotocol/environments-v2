import { exec as exec_async, ExecException, ExecOptions } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'
import { promisify } from 'util'

import { network as hh_network } from 'hardhat'

const exec = promisify(exec_async)

/**
 * A thin wrapper around child_process::exec: execute a command, return stdout/stderr/error
 * As a convenience, automatically sets encoding to utf-8
 */
export async function execute(
  command: string,
  options?: ExecOptions,
  callback?: (error: ExecException | null, stdout: Buffer, stderr: Buffer) => void
): Promise<{ stdout: string; stderr: string; error?: any }> {
  try {
    const results = await exec(command, {
      encoding: 'utf-8',
      ...options,
    })
    return { stdout: results.stdout, stderr: results.stderr }
  } catch (x) {
    return { stdout: (x as any).stdout, stderr: (x as any).stderr, error: x }
  }
}

export async function hardhat_fork(block_number?: number, network: 'eth-mainnet' | 'arb-mainnet' = 'eth-mainnet') {
  const alchemy_keys = JSON.parse(await fs.readFile(join(__dirname, '..', '.alchemyKey'), { encoding: 'utf-8' }))
  const alchemy_key = alchemy_keys[network]

  await hh_network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: alchemy_key,
          blockNumber: block_number,
        },
      },
    ],
  })
}
