import { ethers, waffle } from 'hardhat'
import {BigNumber} from 'ethers';

import { YieldEnvironment } from '../fixtures/yieldEnvironment'

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
    
    const yieldEnv = await YieldEnvironment.setup(
        ownerAcc,
        ilks.map((ilk:string) => ethers.utils.isAddress(ilk)? ilk : ethers.utils.formatBytes32String(ilk).slice(0, 14) ),
        series.map((series:Uint8Array ) => ethers.utils.hexlify(series))
    )

    return yieldEnv
}

loadFixture(fixture).then( async ( yieldEnv : YieldEnvironment )  => { 

    console.log(`"Cauldron": "${yieldEnv.cauldron.address}",`)
    console.log(`"Ladle" : "${yieldEnv.ladle.address}",`)
    console.log(`"Witch" : "${yieldEnv.witch.address}"`)
    console.log(`"PoolRouter" : "${yieldEnv.poolRouter.address}"`)
    
    console.log('Assets:')
    yieldEnv.assets.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })

    console.log('Oracles:')
    yieldEnv.oracles.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })
    
    console.log('Series:')
    yieldEnv.series.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })
    
    console.log('Joins:')
    yieldEnv.joins.forEach((value:any, key:any)=>{ console.log(`"${key}" : "${value.address}",` ) })

    console.log('Vaults:')
    yieldEnv.vaults.forEach((value:any, key:any) => console.log(value))

    console.log('Pools:')
    yieldEnv.pools.forEach((value:any, key:any)=>{    
        value.forEach(async (v:any,k:any) => {
            console.log(`"${k}" : "${v.address}",`)
        })
    })

    fundExternalAccounts(yieldEnv.assets);

}

);