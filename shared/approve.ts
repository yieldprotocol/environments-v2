import {
  getOwnerOrImpersonate,
  readProposal,
  isFork,
  advanceTime,
  ProposalState,
  awaitAndRequireProposal,
} from '../shared/helpers'
import { BigNumber } from 'ethers'
import { Timelock__factory } from '../typechain'
const { governance } = require(process.env.CONF as string)

/** @dev Approve on the timelock using the hash from 'tmp/proposal.txt' */

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(governance.get('multisig')!, BigNumber.from('1000000000000000000'))
  const timelock = Timelock__factory.connect(governance.get('timelock')!, signerAcc)
  const [proposalHash] = readProposal()
  console.log(`Proposal: ${proposalHash}`)

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, proposalHash, requiredConfirmations)

  if ((await timelock.proposals(proposalHash)).state === ProposalState.Proposed) {
    console.log('Approving')
    const tx = await timelock.approve(proposalHash)
    await requireProposalState(tx, ProposalState.Approved)
    console.log(`Approved: ${proposalHash}`)
    if (isFork()) advanceTime(await timelock.delay())
  }
})()
