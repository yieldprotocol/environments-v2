import { ethers, waffle } from 'hardhat'
import { BigNumber } from 'ethers';

import { VaultEnvironment } from '../fixtures/vault'

import { Cauldron } from '../typechain/Cauldron'
import { Pool } from '../typechain/Pool'
import { FYToken } from '../typechain/FYToken'
import { Ladle } from '../typechain/Ladle'

/**
 * 
 * README: 
 * npx hardhat run ./environments/development.ts --network localhost
 *
 */

const { loadFixture } = waffle

const ilksRandom:Uint8Array[] = Array.from({length: 3}, () => ethers.utils.randomBytes(6));

const series:Uint8Array[] = Array.from({length: 5}, () => ethers.utils.randomBytes(6));
const ilks: string[] = ['DAI', 'USDC', 'USDT']

const externalTestAccounts = [
    "0x885Bc35dC9B10EA39f2d7B3C94a7452a9ea442A7",
]

const fundExternalAccounts = async (assetList:Map<string, any>) => {
    const [ ownerAcc ] = await ethers.getSigners();
    await Promise.all(
        externalTestAccounts.map((to:string)=> {
            /* add test Eth */
            ownerAcc.sendTransaction({to,value: ethers.utils.parseEther("100")})
            /* add test asset[] values */
            assetList.forEach(async (value:any, key:any)=> {
                await value.transfer(to, ethers.utils.parseEther("1000")); 
            })
        })
    )
    console.log('External accounts funded with 100ETH, and 1000 of each asset')
};

/* Update the available series based on Cauldron events */
const getDeployedSeries = async (cauldronAddress:string): Promise<string[]> => {
    const cauldron: Cauldron = (await ethers.getContractAt('Cauldron', cauldronAddress ) as unknown) as Cauldron; 
    /* get both serieAdded events */
    const seriesAddedEvents = await cauldron.queryFilter('SeriesAdded' as any);
    /* Get the seriesId */
    return Promise.all(
        seriesAddedEvents.map(async (x:any) : Promise<string> => {
            const { seriesId: id, baseId, fyToken } = cauldron.interface.parseLog(x).args;
             return fyToken;
            }
        )
    )
}

/* Update the ilks info based on addresses */
const getIlks = async (ilks:string[])  => {

}

const linkPool = async (pool: Pool, ladleAddress: string) => {
    const [ ownerAcc ] = await ethers.getSigners();
    const ladle = await ethers.getContractAt('Ladle', ladleAddress, ownerAcc);
    const fyToken = (await ethers.getContractAt('FYToken', await pool.fyToken()) as unknown) as FYToken;
    const seriesId = await fyToken.name()
    await ladle.addPool(seriesId, pool.address)
}

const fixture = async () =>  {
    const [ ownerAcc ] = await ethers.getSigners();
    
    const vaultEnv = await VaultEnvironment.setup(
        ownerAcc,
        ilks.map((ilk:string) => ethers.utils.isAddress(ilk)? ilk : ethers.utils.formatBytes32String(ilk).slice(0, 14) ),
        series.map((series:Uint8Array ) => ethers.utils.hexlify(series))
    )

    return vaultEnv
}

loadFixture(fixture).then( async ( vaultEnv : VaultEnvironment )  => { 

    console.log(`"Cauldron": "${vaultEnv.cauldron.address}",`)
    console.log(`"Ladle" : "${vaultEnv.ladle.address}",`)
    console.log(`"Witch" : "${vaultEnv.witch.address}"`)
    console.log(`"PoolRouter" : "${vaultEnv.poolRouter.address}"`)
    
    console.log('Assets:')
    vaultEnv.assets.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })

    console.log('Oracles:')
    vaultEnv.oracles.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })
    
    console.log('Series:')
    vaultEnv.series.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })
    
    console.log('Joins:')
    vaultEnv.joins.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })

    console.log('Vaults:')
    vaultEnv.vaults.forEach((value:any, key:any) => console.log(value))

    console.log('Pools:')
    vaultEnv.pools.forEach((value:any, key:any)=>{    
        value.forEach(async (v:any,k:any) => {
            console.log(`"${k}" : "${v.address}",`)
        })
    })

    fundExternalAccounts(vaultEnv.assets);

}

);