const csv = require('csv-parser')
const fs = require('fs')

import { ethers } from 'hardhat'
import { BigNumber } from 'ethers'

import { getOwnerOrImpersonate, proposeApproveExecute } from '../../../../../shared/helpers'
import { Strategy__factory } from '../../../../../typechain'
import { sendTokensProposal } from '../../../../fragments/emergency/sendTokens'

const { governance, developer, filePath, strategyAddr, affectedStrategyAddr } = require(process.env.CONF as string)

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  // Contract instantiation
  const timelock = await ethers.getContractAt('Timelock', governance.get('timelock') as string, ownerAcc)

  // Build the proposal
  let proposal: Array<{ target: string; data: string }> = []

  // Build strategy token dispersal data from user snapshot csv
  let newUserStrategyBalances: Array<[string, string, BigNumber]> = [] // [tokenAddr, destAddr, amount][]
  let newUserStrategyBalancesUnadjusted: Array<[string, string, BigNumber]> = [] // [tokenAddr, destAddr, amount][]
  let totalAmount = ethers.constants.Zero

  const strategy = Strategy__factory.connect(strategyAddr, timelock.signer)
  const affectedStrategy = Strategy__factory.connect(affectedStrategyAddr, timelock.signer)

  const [newStrategyTokens, decimals, affectedTotalSupply] = await Promise.all([
    strategy.balanceOf(timelock.address),
    strategy.decimals(),
    affectedStrategy.totalSupply(),
  ])

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', ({ Account, Balance }: { Account: string; Balance: string }) => {
      const _balance = ethers.utils.parseUnits(Balance, decimals)

      // adjust strategy token amount dispersed based on strategy tokens received after investing in strategy with timelock
      // newUserStratBal =  newStratTokens * user balance at snapshot / affected strat totalSupply
      const adjustedBal = newStrategyTokens.mul(_balance).div(affectedTotalSupply)
      newUserStrategyBalances.push([strategyAddr, Account, adjustedBal]) // this is what we actually use
      newUserStrategyBalancesUnadjusted.push([strategyAddr, Account, _balance])

      totalAmount = totalAmount.add(adjustedBal)
    })
    .on('end', async () => {
      console.log(`Total amount of tokens to send is ${ethers.utils.formatUnits(totalAmount, decimals)}`)
      console.log(`Total amount of tokens in timelock is ${ethers.utils.formatUnits(newStrategyTokens, decimals)}`)
      console.log(
        '🦄 ~ file: sendDAIStrategyTokens.ts ~ line 44 ~ .on ~ newUserStrategyBalances',
        newUserStrategyBalances
      )
      console.log(
        '🦄 ~ file: sendDAIStrategyTokens.ts ~ line 46 ~ .on ~ newUserStrategyBalancesUnadjusted',
        newUserStrategyBalancesUnadjusted
      )

      // return if not enough balance in timelock
      if (newStrategyTokens.lt(totalAmount)) {
        console.log('Not enough tokens in the timelock')
        return
      }
      return
      proposal = proposal.concat(await sendTokensProposal(timelock, newUserStrategyBalances))

      // Propose, Approve & execute
      await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string, developer)
    })
})()
