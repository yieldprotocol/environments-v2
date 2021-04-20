import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers';
import { BaseProvider } from '@ethersproject/providers'
import { VaultEnvironment } from '../fixtures/vault'
import { THREE_MONTHS } from '../shared/constants';

/**
 * 
 * README
 * 
 * Change these parameters/lists:
 * 
 * ilks: symbol string OR address of predeployed token  AND a whale account for funding test tokens
 * bases: symbol string only 
 * maturities: leave blank for autogeneration 
 * externalTestAccounts: add any account to be funded with test ETH and tokens
 * buildVaults: whether or not to build test vault in owner account
 * numberOfMaturities: number of maturities to generate ( only applicable if maturities[] is empty )
 * 
 */
 const ilks: string[][] =  [ 
     ['DAI', ''],
     ['USDC',''],
     ['USDT',''],
     ['TST', ''], // mock token example ( tokens are minted, no funder needed)
    ]
 const bases: string[] = ['DAI']
 const maturities: number[] = []
 const externalTestAccounts = []
 const buildVaults = true
 const numberOfMaturities = 4
 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

const { loadFixture } = waffle

const generateMaturities = async (n:number) => {
    const provider: BaseProvider = await ethers.provider 
    const now = (await provider.getBlock(await provider.getBlockNumber())).timestamp
    let count: number = 1
    const maturities = Array.from({length: n}, () => now + THREE_MONTHS * count++ );
    return maturities;
}

// exported fixture function
export const fixture = async () =>  {
    const [ ownerAcc ] = await ethers.getSigners();    
    const vaultEnv = await VaultEnvironment.setup(
        ownerAcc,
        ilks,
        bases, 
        maturities.length ? maturities : await generateMaturities(numberOfMaturities), // if maturities list is empty, generate them
        buildVaults
    )
    return vaultEnv
}

// loaded fixture (if required -> eg. for post deploy logging see: development.ts )
loadFixture(fixture).then( async ( vaultEnv : VaultEnvironment )  => { 
    return vaultEnv;
}

);