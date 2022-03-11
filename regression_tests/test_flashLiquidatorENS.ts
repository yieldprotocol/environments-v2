import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FlashLiquidator, FlashLiquidator__factory } from "../typechain";

import { expect } from "chai";
import { ethers, network } from "hardhat";

import { Logger } from "tslog";

import { LiquidatorConfig, run_liquidator, TestFixture, testSetUp } from "./utils_liquidator";
import { hardhat_fork as fork } from "./utils";


const logger: Logger = new Logger();

const g_multicall2 = "0x5ba1e12693dc8f9c48aad8770482f4739beed696";
const g_witch = "0x53C3760670f6091E1eC76B4dd27f73ba4CAd5061";
const g_uni_router_02 = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const g_flash_loaner = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const g_port = 8551;

async function deploy_flash_liquidator(): Promise<[SignerWithAddress, LiquidatorConfig]> {
    const [owner] = await ethers.getSigners() as SignerWithAddress[];

    const flFactory = await ethers.getContractFactory("FlashLiquidator") as FlashLiquidator__factory;


    const liquidator = await flFactory.deploy(g_witch, g_uni_router_02, g_flash_loaner) as FlashLiquidator
    return [owner, new LiquidatorConfig(g_multicall2, liquidator.address, g_witch, g_uni_router_02, network.config.chainId!, g_port)];
}

describe("flash liquidator: ENS vaults", function () {
    let fixture: TestFixture = new TestFixture();
    fixture.chain_id = 1;

    testSetUp(this, g_port, fixture);

    it("liquidates ENS vaults on Dec-14-2021 (block: 13804681)", async function () {

        await fork(13804681);
        const [_owner, liquidator] = await deploy_flash_liquidator();

        const expected_to_liquidate = [
            "18982d40f1158fdb6086b906",
            "4e63c3db8b818e75fb41cf2b",
            "638fe71ed9a58f6642cc27f3",
            "89ea17518550c6bf7f928ec4",
            "b19915eed14c3fbcb8f1246d"
        ]

        const starting_balance = await _owner.getBalance();

        const liquidator_logs = await run_liquidator(fixture, liquidator, {vaults_whitelist: expected_to_liquidate});

        let bought = 0;


        for (const log_record of liquidator_logs) {
            if (log_record["level"] == "INFO" && log_record["fields"]["message"] == "Submitted buy order") {
                bought++;
            }
            expect(log_record["level"]).to.not.equal("ERROR"); // no errors allowed
        }
        expect(bought).to.be.equal(expected_to_liquidate.length);

        const final_balance = await _owner.getBalance();
        logger.warn("ETH used: ", starting_balance.sub(final_balance).div(1e12).toString(), "uETH")
    });


    it("liquidates multihop ENS vaults on Jan-20-2022 (block: 14045343)", async function () {
        await fork(14045343);
        const [_owner, liquidator] = await deploy_flash_liquidator();

        const vault_to_be_auctioned = "b50e0c2ce9adb248f755540b";

        const liquidator_logs = await run_liquidator(fixture, liquidator, {vaults_whitelist: [vault_to_be_auctioned]});

        let vault_is_liquidated = false;
        for (const log_record of liquidator_logs) {
            if (log_record["level"] == "INFO" && log_record["fields"]["message"] == "Submitted buy order") {
                const vault_id = log_record["fields"]["vault_id"];
                if (vault_id == `"${vault_to_be_auctioned}"`) {
                    vault_is_liquidated = true;
                }
            }
        }

        expect(vault_is_liquidated).to.equal(true);
    })
});
