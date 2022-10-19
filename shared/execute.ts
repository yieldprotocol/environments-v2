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
import { TransactionRequest } from '@ethersproject/providers'
const { developer, governance } = require(process.env.CONF as string)

;(async () => {
  const proposal = readFileSync('./tmp/proposal.txt', 'utf8')

  const ownerAcc = await getOwnerOrImpersonate(developer)

  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const txHash = '0xb9e9dd7ecb4941265130bda91f031d7617d0bbed386c0cc2b41dacfce74e4636'

  const requiredConfirmations = isFork() ? 1 : 2
  const requireProposalState = awaitAndRequireProposal(timelock, txHash, requiredConfirmations)

  if ((await timelock.proposals(txHash)).state === ProposalState.Approved) {
    console.log('Executing')
    // Execute
    let signerAcc
    if (developer) {
      if (network.name === 'localhost' || network.name.includes('tenderly')) {
        signerAcc = await impersonate(developer as string, BigNumber.from('1000000000000000000'))
        advanceTime(await timelock.delay())
      } else {
        signerAcc = await ethers.getSigner(developer)
      }
    } else {
      ;[signerAcc] = await ethers.getSigners()
    }
    const transactionRequest = {
      to: timelock.address,
      data: timelock.interface.encodeFunctionData('execute', [proposal]),
    } as TransactionRequest
    await ownerAcc.sendTransaction(transactionRequest)
    // await requireProposalState(transactionRequest, ProposalState.Unknown)
    console.log(`Executed ${txHash}`)
  }
})()
