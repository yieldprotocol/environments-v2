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
    mintedStrategyTokens: BigNumber
  }
}

const config: IConfig = {
  YSDAI6MJD: {
    filePath: path.join(__dirname, 'csv/ARBITRUM_YSDAI6MJD.csv'), // user strategy token balances at snapshot
    addr: strategies.get(YSDAI6MJD) as string,
    affectedAddr: '0xe7214af14bd70f6aac9c16b0c1ec9ee1ccc7efda',
    mintedStrategyTokens: BigNumber.from('46667301065444911928234'), // the number of strategy tokens minted by dev in proposal 1
  },
  YSUSDC6MJD: {
    filePath: path.join(__dirname, 'csv/ARBITRUM_YSUSDC6MJD.csv'), // user strategy token balances at snapshot
    addr: strategies.get(YSUSDC6MJD) as string,
    affectedAddr: '0xdc705fb403dbb93da1d28388bc1dc84274593c11',
    mintedStrategyTokens: BigNumber.from('158031149406'), // the number of strategy tokens minted by dev in proposal 1
  },
}

// Gather both the dai and usdc strategy token send data to use in the proposal
export const sendData = async () => {
  const signer = ethers.provider.getSigner()
  const timelockAddr = governance.get('timelock') as string

  // parse through the csv data to get the strategy token send data
  const parse = async (strategyName: string) => {
    const { filePath, addr, mintedStrategyTokens } = config[strategyName]
    const strategy = Strategy__factory.connect(addr, signer)
    const [timelockBal, decimals] = await Promise.all([strategy.balanceOf(timelockAddr), strategy.decimals()])

    // get the sum of all affected balances to use in calculating new strategy token balance
    let totalAffectedBalance = ethers.constants.Zero

    await new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', ({ Balance }: { Balance: string }) => {
          const _balance = ethers.utils.parseUnits(Balance, decimals)

          totalAffectedBalance = totalAffectedBalance.add(_balance)
        })
        .on('end', () => {
          resolve(totalAffectedBalance)
        })
    })

    // Build strategy token dispersal data from csv
    let newStrategyBalances: Array<[string, string, BigNumber]> = [] // [tokenAddr, destAddr, amount][]
    let totalAmount = ethers.constants.Zero

    await new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', ({ Account, Balance }: { Account: string; Balance: string }) => {
          const _balance = ethers.utils.parseUnits(Balance, decimals)

          if (_balance.gt(ethers.constants.Zero)) {
            // adjust strategy token amount dispersed based on strategy tokens received after investing in strategy with timelock
            // newUserStratBal = new strategy LP tokens minted by dev * user balance at snapshot / sum of all affected balances
            const adjustedBal = mintedStrategyTokens.mul(_balance).div(totalAffectedBalance)
            newStrategyBalances.push([addr, Account, adjustedBal])

            totalAmount = totalAmount.add(adjustedBal)
          }
        })
        .on('end', () => {
          console.log(`Total amount of ${strategyName} tokens to send is ${totalAmount.toString()}`)
          console.log(`Number of ${strategyName} tokens minted from proposal 1 is ${mintedStrategyTokens.toString()}`)
          console.log(`Number of ${strategyName} tokens in timelock is ${timelockBal.toString()}`)

          if (totalAmount.gt(mintedStrategyTokens)) {
            console.log('Amount to be distributed is greater than the minted amount')
            return
          }

          // return if not enough balance in timelock
          if (mintedStrategyTokens.gt(timelockBal)) {
            console.log('Not enough tokens in the timelock')
            return
          }

          resolve(newStrategyBalances)
        })
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
