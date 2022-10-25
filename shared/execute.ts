import { getOwnerOrImpersonate, isFork, readProposal, ProposalState, awaitAndRequireProposal } from '../shared/helpers'
import { BigNumber, utils } from 'ethers'

import { Timelock__factory } from '../typechain'
import { TransactionRequest } from '@ethersproject/providers'
const { developer, governance } = require(process.env.CONF as string)

/** @dev Execute on the timelock using the hash and execution call from 'tmp/proposal.txt' */

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(developer as string, BigNumber.from('1000000000000000000'))
  const timelock = Timelock__factory.connect(governance.get('timelock')!, signerAcc)
  const [proposalHash, executeCall] = readProposal()
  console.log(`Proposal: ${proposalHash}`)

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, proposalHash, requiredConfirmations)

  if ((await timelock.proposals(proposalHash)).state === ProposalState.Approved) {
    console.log('Executing')

    const executeRequest: TransactionRequest = {
      to: timelock.address,
      data: executeCall,
    }
    const gasEstimate = await signerAcc.estimateGas(executeRequest)
    const ethBalance = await signerAcc.getBalance()
    console.log(`Estimated gas: ${gasEstimate} - ETH Balance: ${utils.formatEther(ethBalance)}`)

    const tx = await signerAcc.sendTransaction(executeRequest)
    await requireProposalState(tx, ProposalState.Unknown)
    console.log(`Executed ${proposalHash}`)
  }
})()
