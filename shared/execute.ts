import { utils } from 'ethers'
import { awaitAndRequireProposal, getOwnerOrImpersonate, isFork, ProposalState, readProposal } from './helpers'

import { TransactionRequest } from '@ethersproject/providers'
import { Timelock__factory } from '../typechain'
import { TIMELOCK } from './constants'

const { developer, governance } = require(process.env.CONF as string)

/** @dev Execute on the timelock using the hash and execution call from 'tmp/proposal.txt' */

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(developer as string, utils.parseEther('1'))
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), signerAcc)
  const [proposalHash, executeCall] = readProposal()
  console.log(`Proposal: ${proposalHash}`)

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, proposalHash, requiredConfirmations)

  if ((await timelock.proposals(proposalHash)).state === ProposalState.Approved) {
    console.log('Executing')

    const executeRequest: TransactionRequest = {
      to: timelock.address,
      data: executeCall,
      gasLimit: 20_000_000,
    }
    const gasEstimate = await signerAcc.estimateGas(executeRequest)
    const ethBalance = await signerAcc.getBalance()
    console.log(`Estimated gas: ${gasEstimate} - ETH Balance: ${utils.formatEther(ethBalance)}`)

    executeRequest.gasLimit = Math.ceil(gasEstimate.toNumber() * 1.2)

    const tx = await signerAcc.sendTransaction(executeRequest)
    await requireProposalState(tx, ProposalState.Unknown)
    console.log(`Executed ${proposalHash}`)
    console.log(`TxHash: ${tx.hash}`)
  }
})()
