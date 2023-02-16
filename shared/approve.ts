import { utils } from 'ethers'
import {
  advanceTime,
  awaitAndRequireProposal,
  getOwnerOrImpersonate,
  isFork,
  ProposalState,
  readProposal,
} from './helpers'
import { Timelock__factory } from '../typechain'
import { MULTISIG, TIMELOCK } from './constants'
const { governance } = require(process.env.CONF as string)

/** @dev Approve on the timelock using the hash from 'tmp/proposal.txt' */

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(governance.getOrThrow(MULTISIG), utils.parseEther('1'))
  const timelock = Timelock__factory.connect(governance.getOrThrow(TIMELOCK), signerAcc)
  const [proposalHash] = readProposal()
  console.log(`Proposal: ${proposalHash}`)

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, proposalHash, requiredConfirmations)

  if ((await timelock.proposals(proposalHash)).state === ProposalState.Proposed) {
    console.log('Approving')
    const tx = await timelock.approve(proposalHash)
    await requireProposalState(tx, ProposalState.Approved)
    console.log(`Approved: ${proposalHash}`)
    const delay = await timelock.delay()
    if (delay > 0 && isFork()) advanceTime(delay)
  } else {
    console.log(`Not proposed: ${proposalHash}`)
  }
})()
