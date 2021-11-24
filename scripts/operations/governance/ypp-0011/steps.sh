#!/bin/bash

set -euxo pipefail
RUN="npx hardhat run --network arb_rinkeby "
HERE=$(dirname $0)

$RUN scripts/core/10_libraries.ts
$RUN scripts/core/11_timelock.ts
$RUN scripts/core/12_cloak.ts

### Phase 1: create contracts
$RUN $HERE/01_createAssets.ts

$RUN $HERE/02_createOracles.ts
$RUN $HERE/02_createOracles.ts
$RUN $HERE/02_createOracles.ts

# no 13_oracles.ts
$RUN scripts/core/14_factories.ts
$RUN scripts/core/15_cauldron.ts
$RUN scripts/core/16_ladle.ts
$RUN scripts/core/17_witch.ts
$RUN scripts/core/18_wand.ts

### Phase 2: register sources
$RUN $HERE/10_registerSpotSources.ts
$RUN $HERE/10_registerSpotSources.ts
$RUN $HERE/10_registerSpotSources.ts

$RUN $HERE/11_registerRateChiSources.ts
$RUN $HERE/11_registerRateChiSources.ts
$RUN $HERE/11_registerRateChiSources.ts

### Phase 3: add assets
$RUN $HERE/20_addAssets.ts

$RUN $HERE/21_makeBase.ts
$RUN $HERE/21_makeBase.ts
$RUN $HERE/21_makeBase.ts

$RUN $HERE/22_makeIlks.ts
$RUN $HERE/22_makeIlks.ts
$RUN $HERE/22_makeIlks.ts

$RUN $HERE/23_addSeries.ts

### Phase 4: pools and strategies
$RUN $HERE/30_createStrategies.ts
