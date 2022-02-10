import { ethers } from 'hardhat'
import * as fs from 'fs'
import { jsonToMap } from '../../shared/helpers'

import { Timelock } from '../../typechain/Timelock'
;(async () => {
  const proposals: Array<string> = [
    '0x0299ce167d78eb0d527ab8b1ce91228d717ed60bed76e31b432c11fdcff18c03',
    '0x058c80fa85a9ff6b9b2dee9c00a2646d3c4d03f008844bd4403685fecd096207',
    '0x0cc33830fa131ca121f84123cf65fddd890204977ca3860b2dd7b5b20f9d6640',
    '0x2037dc1c7fc3f6023a0b4c5c3442ab9ef8044caf6a3acc006fdc2972ae1d51be',
    '0x3235638344bca746900edf05f60e9df20e134e18c85a4e66e01d30f441656ff6',
    '0x3c710b5773b2cdab3feab13593ca6008c2a4dfb41e7f4712938c42c8e080ac41',
    '0x413a3d867c81bc889370e95ae351636526696479f92c25343f03ba257400f438',
    '0x4dac8e955c02cf339e13e29463086ed37761658b8c75e2a60b7486b31f9dc7c9',
    '0x6f1e5830e73cebc729e3d173d008390011382c533cbb718685d350e2bd12cf6e',
    '0x71f23dbb7b650fd5aa445d612b59de1aa28788dfda1879cfc75cdee621c17dca',
    '0x85c4aa5b547c9241ab52fce1090e3f29a77e8c6de822881b5fdfd1f30733399c',
    '0x8812b4e95db2de46174beffe51db8835e09f7162496b15f81829e86a269e3905',
    '0x8c8151c6667611f886d904b7ba3cdb6cbb674be4eb674f5289443f0f84ef9b07',
    '0x9058f2431ab36805230962752f5c3841dbcfe7c6da2618a767c3dbe66fb14806',
    '0x9bce1b3c869df99d1fc5d7e9ab7f6dac6c168baea5308ddd583c065656c4a02f',
    '0xa05ddcbbb3a310cc59fd34fe468d444eaad9272d9f2dcf332e2231a17c235b7f',
    '0xa154d4d05c93906898904174d932d749ebb8a25ac0bbecae550475d9e0385371',
    '0xad60f1e339bf4325099c00129cc2adbf74b1bcff67fb734b4c5d5842b46aa9f0',
    '0xc37bf15f109345ff18e107ea37ec4b89277814f0e6a794a8e9857f380c58fd6b',
    '0xc3e443fa84ce6f578f76a18d120ffc099307af0ade54ea6a582e9b73b8cd37e8',
    '0xc49b805eb66e2ca7e3f0c603c910fc7a3c1533bd10b48890d6df8fc15ca58ed6',
    '0xc8bc8778fdcf4ade14452a8fd899a942f65606d95444f49a4e43e6b54412961d',
    '0xcd859e3110a8f11c7d8eb11b4b1708d6167c5dc8f6fbaa29be5384b13432cfa9',
    '0xd91594f201fa6cc3fb854bacbf5c06f2fd8b430878f343d14ad431c9da7ffcb2',
    '0xdf4aa4f9f1364f37e85b56cf02941b53f2528589f83041f22cb6f5da0d36fa0a',
    '0xe03f9a73ae5f7bcad037d9a84789d410fd34e8fec878477eeef432bab6d1bb73',
    '0xe8fac10e1cf6ff3224171f8c4eb150e9b2ff522a7a2d2e812039c7b6aa6d4ae2',
    '0xe9644769b6947ac1528fa42bf51d47d376246112c8fa6330c06d3112961e985b',
    '0xf2f56e461cc9f84348e610013b352271bda7aec45e6b3761e427af7d2eaa4cdd',
    '0xf753bca331725a5043ce1883806aebdbe6108f36086eb6be661a67f68323864b',
    '0xf761517e70061e8d8c2226321d2c82f8550f94d639de2d034bfee4491f273d5c',
    '0xfd7836a6021bf4eff9f2500ac27ccfb60bde40f4dc07709332cc394c5ad91410',
  ]
  const [ownerAcc] = await ethers.getSigners()
  const governance = jsonToMap(fs.readFileSync('./addresses/governance.json', 'utf8')) as Map<string, string>

  // Contract instantiation
  const timelock = (await ethers.getContractAt(
    'Timelock',
    governance.get('timelock') as string,
    ownerAcc
  )) as unknown as Timelock

  for (let proposal of proposals) {
    console.log(`${proposal}: ${(await timelock.proposals(proposal)).toString()}`)
  }
})()
