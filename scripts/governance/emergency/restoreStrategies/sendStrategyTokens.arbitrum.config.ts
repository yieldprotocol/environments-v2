const path = require('path')
const fs = require('fs')
const csv = require('csv-parser')

import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { YSDAI6MJD, YSUSDC6MJD } from '../../../../shared/constants'
import { Strategy__factory } from '../../../../typechain'
import * as base_config from '../../base.arb_mainnet.config'

export const governance: Map<string, string> = base_config.governance
export const strategies: Map<string, string> = base_config.strategies
export const developer = '0x1662BbbDdA3fb169f10C495AE27596Af7f8fD3E1'

interface IConfig {
  [stratName: string]: {
    filePath: string
    addr: string
    affectedAddr: string
  }
}

const config: IConfig = {
  YSDAI6MJD: {
    filePath: path.join(__dirname, 'csv/ARBITRUM_YSDAI6MJD.csv'), // user strategy token balances at snapshot
    addr: strategies.get(YSDAI6MJD) as string,
    affectedAddr: '0xe7214af14bd70f6aac9c16b0c1ec9ee1ccc7efda',
  },
  YSUSDC6MJD: {
    filePath: path.join(__dirname, 'csv/ARBITRUM_YSUSDC6MJD.csv'), // user strategy token balances at snapshot
    addr: strategies.get(YSUSDC6MJD) as string,
    affectedAddr: '0xdc705fb403dbb93da1d28388bc1dc84274593c11',
  },
}

// Gather both the dai and usdc strategy token send data to use in the proposal
export const sendData = async () => {
  const signer = ethers.provider.getSigner()
  const timelockAddr = governance.get('timelock') as string

  // parse through the csv data to get the strategy token send data
  const parse = async (strategyName: string) => {
    const { filePath, addr, affectedAddr } = config[strategyName]

    // Build strategy token dispersal data from csv
    let newStrategyBalances: Array<[string, string, BigNumber]> = [] // [tokenAddr, destAddr, amount][]
    let totalAmount = ethers.constants.Zero

    const strategy = Strategy__factory.connect(addr, signer)
    const affectedStrategy = Strategy__factory.connect(affectedAddr, signer)

    const [newStrategyTokens, decimals, affectedTotalSupply] = await Promise.all([
      strategy.balanceOf(timelockAddr),
      strategy.decimals(),
      affectedStrategy.totalSupply(),
    ])

    await fs
      .createReadStream(filePath)
      .pipe(csv())
      .on('data', ({ Account, Balance }: { Account: string; Balance: string }) => {
        const _balance = ethers.utils.parseUnits(Balance, decimals)

        // adjust strategy token amount dispersed based on strategy tokens received after investing in strategy with timelock
        // newUserStratBal = new strategy LP tokens minted by dev * user balance at snapshot / affected strategy totalSupply
        const adjustedBal = newStrategyTokens.mul(_balance).div(affectedTotalSupply)
        newStrategyBalances.push([addr, Account, adjustedBal])

        totalAmount = totalAmount.add(adjustedBal)
      })
      .on('end', () => {
        console.log(
          `Total amount of ${strategyName} tokens to send is ${ethers.utils.formatUnits(totalAmount, decimals)}`
        )
        console.log(
          `Total amount of ${strategyName} tokens in timelock is ${ethers.utils.formatUnits(
            newStrategyTokens,
            decimals
          )}`
        )

        // return if not enough balance in timelock
        if (newStrategyTokens.lt(totalAmount)) {
          console.log('Not enough tokens in the timelock')
          return
        }
      })
    return newStrategyBalances
  }

  // combine dai and usdc strategy data
  let totalSendData: Array<[string, string, BigNumber]> = []
  for (const strat of [YSDAI6MJD, YSUSDC6MJD]) {
    totalSendData.push(...(await parse(strat)))
  }

  return totalSendData
}
