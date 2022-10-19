import {
  getOwnerOrImpersonate,
  readHash,
  isFork,
  advanceTime,
  ProposalState,
  awaitAndRequireProposal,
} from '../shared/helpers'
import { BigNumber } from 'ethers'
import { Timelock__factory } from '../typechain'
const { governance } = require(process.env.CONF as string)

;(async () => {
  const signerAcc = await getOwnerOrImpersonate(governance.get('multisig')!, BigNumber.from('1000000000000000000'))
  const timelock = Timelock__factory.connect(governance.get('timelock')!, signerAcc)
  const txHash = readHash()
  console.log(`Proposal: ${txHash}`)

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, txHash, requiredConfirmations)

  if ((await timelock.proposals(txHash)).state === ProposalState.Proposed) {
    console.log('Approving')
    const tx = await timelock.approve(txHash)
    await requireProposalState(tx, ProposalState.Approved)
    console.log(`Approved: ${txHash}`)
    if (isFork()) advanceTime(await timelock.delay())
  }
})()
