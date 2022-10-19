import { ethers, network } from 'hardhat'
import {
  getOwnerOrImpersonate,
  impersonate,
  isFork,
  advanceTime,
  ProposalState,
  awaitAndRequireProposal,
} from '../shared/helpers'
import { BigNumber } from 'ethers'
import { keccak256, toUtf8Bytes } from 'ethers/lib/utils'
import { readFileSync } from 'fs'
import { Timelock } from '../typechain'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
const { developer, governance } = require(process.env.CONF as string)

;(async () => {
  const proposal = readFileSync('./tmp/proposal.txt', 'utf8')

  const ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const txHash = keccak256(toUtf8Bytes('0x' + proposal.slice(10, proposal.length)))
  console.log(txHash)

  const requiredConfirmations = isFork() ? 1 : 2
  // const requireProposalState = awaitAndRequireProposal(timelock, txHash, requiredConfirmations)

  const multisig = governance.get('multisig')

  if ((await timelock.proposals(txHash)).state === 1) {
    console.log('Approving')
    let signerAcc: SignerWithAddress
    // Approve, impersonating multisig if in a fork
    if (network.name === 'localhost' || network.name.includes('tenderly')) {
      if (multisig === undefined) throw 'Must provide an address with approve permissions to impersonate'
      signerAcc = await impersonate(multisig as string, BigNumber.from('1000000000000000000'))
      // Since we are in a testing environment, let's advance time
      console.log('Advancing time')
      advanceTime(await timelock.delay())
    } else {
      // On kovan we have approval permissions
      signerAcc = (await ethers.getSigners())[0]
    }
    const tx = await timelock.connect(signerAcc).approve(txHash)
    // await requireProposalState(tx, ProposalState.Approved)
    console.log(`Approved ${txHash}`)
  }
})()
