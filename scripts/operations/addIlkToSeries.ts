import { ethers } from 'hardhat'
import * as hre from 'hardhat'
import * as fs from 'fs'
import { bytesToString, jsonToMap, stringToBytes6 } from '../../shared/helpers'
import { DAI, USDC, ETH, WBTC } from '../../shared/constants'

import { Cauldron } from '../../typechain/Cauldron'
import { Timelock } from '../../typechain/Timelock'

;(async () => {
  const seriesIlks: Array<[string, string[]]> = [
    [stringToBytes6('0103'), [DAI, USDC, ETH, WBTC]],
    [stringToBytes6('0104'), [DAI, USDC, ETH, WBTC]],
    [stringToBytes6('0203'), [USDC, DAI, ETH, WBTC]],
    [stringToBytes6('0204'), [USDC, DAI, ETH, WBTC]],
  ]

  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: ['0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5'],
  })
  const ownerAcc = await ethers.getSigner('0x5AD7799f02D5a829B2d6FA085e6bd69A872619D5')
  // const [ ownerAcc ] = await ethers.getSigners();
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>
  const protocol = jsonToMap(fs.readFileSync('./addresses/protocol.json', 'utf8')) as Map<string, string>

  const cauldron = (await ethers.getContractAt(
    'Cauldron',
    protocol.get('cauldron') as string,
    ownerAcc
  )) as unknown as Cauldron
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  const proposal: Array<{ target: string; data: string }> = []

  for (let [seriesId, ilkIds] of seriesIlks) {
    const symbol = bytesToString(seriesId)

    proposal.push({
      target: cauldron.address,
      data: cauldron.interface.encodeFunctionData('addIlks', [seriesId, ilkIds]),
    })
    console.log(`addIlks ${symbol}: ${ilkIds}'`)
  }

  // Propose, approve, execute
  const txHash = await timelock.hash(proposal)
  console.log(`Proposal: ${txHash}`)
  if ((await timelock.proposals(txHash)).state === 0) {
    await timelock.propose(proposal)
    while ((await timelock.proposals(txHash)).state < 1) {}
    console.log(`Proposed ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 1) {
    await timelock.approve(txHash)
    while ((await timelock.proposals(txHash)).state < 2) {}
    console.log(`Approved ${txHash}`)
  }
  if ((await timelock.proposals(txHash)).state === 2) {
    await timelock.execute(proposal)
    while ((await timelock.proposals(txHash)).state > 0) {}
    console.log(`Executed ${txHash}`)
  }
})()
