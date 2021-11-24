import { ethers, waffle } from 'hardhat'
import { id } from '@yield-protocol/utils-v2'
import { getAddressMappingFilePath, readAddressMappingIfExists } from '../../../shared/helpers'

import { ChainlinkUSDMultiOracle } from '../../../typechain/ChainlinkUSDMultiOracle'

import { EmergencyBrake } from '../../../typechain/EmergencyBrake'
import { Timelock } from '../../../typechain/Timelock'
import { getContract, getOrDeploy, proposeApproveExecute } from '../../../shared/helpers'
import { AccumulatorMultiOracle } from '../../../typechain'


(async () => {
  const [ownerAcc] = await ethers.getSigners();

  const PROTOCOL_FILE = 'protocol.json';

  const governance = readAddressMappingIfExists('governance.json');

  const timelock = await getContract<Timelock>(ownerAcc, "Timelock", governance.get("timelock"));
  const cloak = await getContract<EmergencyBrake>(ownerAcc, "EmergencyBrake", governance.get("cloak"));
  const ROOT = await timelock.ROOT()

  const accumulatorMultiOracle = await getOrDeploy<AccumulatorMultiOracle>(ownerAcc, 
    PROTOCOL_FILE, "accumulatorOracle", "AccumulatorMultiOracle", [], timelock);

  let chainlinkUSDOracle = await getOrDeploy<ChainlinkUSDMultiOracle>(ownerAcc, 
    PROTOCOL_FILE, "chainlinkUSDOracle", "ChainlinkUSDMultiOracle", [], timelock);

  // Give access to each of the governance functions to the timelock, through a proposal to bundle them
  // Give ROOT to the cloak, revoke ROOT from the deployer
  const proposal: Array<{ target: string; data: string }> = []

  proposal.push({
    target: accumulatorMultiOracle.address,
    data: accumulatorMultiOracle.interface.encodeFunctionData('grantRoles', [
      [id(accumulatorMultiOracle.interface, 'setSource(bytes6,bytes6,uint256,uint256)')],
      timelock.address,
    ]),
  })
  console.log(`accumulatorMultiOracle.grantRoles(gov, timelock)`)

  proposal.push({
    target: accumulatorMultiOracle.address,
    data: accumulatorMultiOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`accumulatorMultiOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: accumulatorMultiOracle.address,
    data: accumulatorMultiOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address]),
  })
  console.log(`accumulatorMultiOracle.revokeRole(ROOT, deployer)`)

  proposal.push({
    target: chainlinkUSDOracle.address,
    data: chainlinkUSDOracle.interface.encodeFunctionData('grantRoles', [
      [id(chainlinkUSDOracle.interface, 'setSource(bytes6,address,address)')],
      timelock.address,
    ]),
  })
  console.log(`chainlinkUSDOracle.grantRoles(gov(${id(chainlinkUSDOracle.interface, 'setSource(bytes6,address,address)')}), timelock)`)

  proposal.push({
    target: chainlinkUSDOracle.address,
    data: chainlinkUSDOracle.interface.encodeFunctionData('grantRole', [ROOT, cloak.address]),
  })
  console.log(`chainlinkUSDOracle.grantRole(ROOT, cloak)`)

  proposal.push({
    target: chainlinkUSDOracle.address,
    data: chainlinkUSDOracle.interface.encodeFunctionData('revokeRole', [ROOT, ownerAcc.address]),
  })
  console.log(`chainlinkUSDOracle.revokeRole(ROOT, deployer)`)

  await proposeApproveExecute(timelock, proposal, governance.get('multisig') as string);
})()
