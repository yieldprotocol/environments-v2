import { ethers, waffle } from 'hardhat'
import { verify, getOriginalChainId, writeAddressMap, getOwnerOrImpersonate } from '../../../../../../../shared/helpers'

import ERC20MockArtifact from '../../../../../../../artifacts/contracts/::mocks/ERC20Mock.sol/ERC20Mock.json'
import { ERC20Mock } from '../../../../../../../typechain/ERC20Mock'

const { deployContract } = waffle
const { protocol, developer } = require(process.env.CONF as string)
/**
 * @dev This script deploys the ENSMock contract
 */

;(async () => {
  let ownerAcc = await getOwnerOrImpersonate(developer)

  let ens: ERC20Mock
  const args = ['Ethereum Name Service', 'ENS']
  if (protocol.get('ensMock') === undefined) {
    ens = (await deployContract(ownerAcc, ERC20MockArtifact, args)) as ERC20Mock
    console.log(`ENSMock, '${ens.address}`)
    verify(ens.address, args)
    protocol.set('ensMock', ens.address)
    writeAddressMap('protocol.json', protocol)
  } else {
    ens = (await ethers.getContractAt('EnsMock', protocol.get('ensMock') as string, ownerAcc)) as unknown as ERC20Mock
    console.log(`Reusing ensMock at ${ens.address}`)
  }
})()
