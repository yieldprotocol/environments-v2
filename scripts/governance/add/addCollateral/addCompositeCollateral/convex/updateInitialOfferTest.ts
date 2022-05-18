import { ethers } from 'hardhat'
import { expect } from 'chai'
import { Witch } from '../../../../../../typechain'
import { impersonate, readAddressMappingIfExists } from '../../../../../../shared/helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { CVX3CRV,WAD } from '../../../../../../shared/constants'

const { developer } = require(process.env.CONF as string)

describe('Revoke governor permissions', function () {
  let witch: Witch
  let developerAcc: SignerWithAddress
  before(async () => {
    developerAcc = await impersonate(developer, WAD)
    const protocol = readAddressMappingIfExists('protocol.json')
    witch = (await ethers.getContractAt('Witch', protocol.get('witch') as string, developerAcc)) as unknown as Witch
  })
  it('test', async () => {
      var ilkData = await witch.callStatic.ilks(CVX3CRV)
      expect(ilkData['initialOffer'].toString()).be.eq("900000000000000000")
  })
})
