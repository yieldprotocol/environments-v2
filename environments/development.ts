import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers';
import { BaseProvider } from '@ethersproject/providers'
import { VaultEnvironment } from '../fixtures/vault'
import { THREE_MONTHS } from '../shared/constants';
import { generateMaturities, fundExternalAccounts } from '../shared/helpers';

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
     //['0x6b175474e89094c44da98b954eedeac495271d0f', '0xc2c5a77d9f434f424df3d39de9e90d95a0df5aca' ],  // DAI + funderAcc
     //['0xdac17f958d2ee523a2206206994597c13d831ec7', '0xb3f923eabaf178fc1bd8e13902fc5c61d3ddef5b'],  // USDT  + funderAcc
     //['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', '0x269d74be03b635e73c5f2454f6baa41ced16406e'], // WBTC + funderAcc
     //['0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', '0xb045fa6893b26807298e93377cbb92d7f37b19eb'], // UNI + funderAcc
     ['DAI',''],
     ['USDC',''],
     ['USDT',''],
     ['TST', ''], // mock token example ( tokens are minted, no funder needed)
    ]
 const bases: string[] = ['DAI','USDC']
 const maturities: number[] = []
 const externalTestAccounts = [ "0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7" ]
 const buildVaults = false
 const numberOfMaturities = 5
 /**
 * 
 * run:
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

const { loadFixture } = waffle

console.time("Environment deployed in");
 
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

loadFixture(fixture).then( async ( vaultEnv : VaultEnvironment )  => { 

    console.log(`"Cauldron": "${vaultEnv.cauldron.address}",`)
    console.log(`"Ladle" : "${vaultEnv.ladle.address}",`)
    console.log(`"Witch" : "${vaultEnv.witch.address}",`)
    console.log(`"PoolRouter" : "${vaultEnv.poolRouter.address}"`)
    
    console.log('Assets:')
    vaultEnv.assets.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })

    console.log('Oracles:')
    vaultEnv.oracles.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })
    
    console.log('Series:')
    vaultEnv.series.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })
    
    console.log('Joins:')
    vaultEnv.joins.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })

    buildVaults && console.log('Vaults:')
    buildVaults && vaultEnv.vaults.forEach((value:any, key:any) => console.log(value))

    console.log('Pools:')
    vaultEnv.pools.forEach((value:any, key:any)=>{    
        value.forEach(async (v:any,k:any) => {
            console.log(`"${k}" : "${v.address}",`)
        })
    })

    await fundExternalAccounts(vaultEnv.assets, externalTestAccounts);
    console.timeEnd("Environment deployed in")

    return vaultEnv;

}

);