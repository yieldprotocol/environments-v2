import { writeAddressMap } from '../../../shared/helpers'

import { ETH, DAI, USDC } from '../../../shared/constants'

(async () => {
    const assets = new Map<string, string>();

    // go to https://bridge.arbitrum.io/ to do L1 -> L2 translation
    assets.set(ETH, "0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681"); // L1: 0xc778417e063141139fce010982780140aa0cd5ab
    assets.set(USDC, "0x6079Dd4565cb1852D6c4190DB7af6C8A69f73Eae"); // L1: 0xeb8f08a975ab53e34d8a0330e0d34de942c95926
    assets.set(DAI, "0x5364Dc963c402aAF150700f38a8ef52C1D7D7F14"); // L1: 0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea
    writeAddressMap("assets.json", assets);
})()