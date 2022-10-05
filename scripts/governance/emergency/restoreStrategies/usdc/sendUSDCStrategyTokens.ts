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
      newUserStrategyBalances.push([strategyAddr, Account, adjustedBal])
    })
    .on('end', async () => {
      proposal = proposal.concat(await sendTokensProposal(timelock, newUserStrategyBalances))
    })

  // Propose, Approve & execute
  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string)
})()
