import {
  getOwnerOrImpersonate,
  isFork,
  readHash,
  readProposal,
  ProposalState,
  awaitAndRequireProposal,
} from '../shared/helpers'
import { BigNumber } from 'ethers'

import { Timelock__factory } from '../typechain'
import { TransactionRequest } from '@ethersproject/providers'
const { developer, governance } = require(process.env.CONF as string)

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(developer as string, BigNumber.from('1000000000000000000'))
  const timelock = Timelock__factory.connect(governance.get('timelock')!, signerAcc)
  const txHash = readHash()
  const proposal = readProposal()
  console.log(`Proposal: ${txHash}`)

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, txHash, requiredConfirmations)

  if ((await timelock.proposals(txHash)).state === ProposalState.Approved) {
    console.log('Executing')
    // Execute

    const executeRequest: TransactionRequest = {
      to: timelock.address,
      data: proposal,
    }
    const gasEstimate = await signerAcc.estimateGas(executeRequest)
    const ethBalance = await signerAcc.getBalance()
    console.log(`Estimated gas: ${gasEstimate} - ETH Balance: ${ethBalance}`)

    const tx = await signerAcc.sendTransaction(executeRequest)
    await requireProposalState(tx, ProposalState.Unknown)
    console.log(`Executed ${txHash}`)
  }
})()
