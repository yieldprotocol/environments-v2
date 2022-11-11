
#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/../../base.mainnet.config
RUN="npx hardhat run --network tenderly"

$RUN $HERE/deployStrategyLever.ts
$RUN $HERE/strategyLeverSetup.ts
$RUN $HERE/strategyLeverSetup.ts
$RUN $HERE/strategyLeverSetup.ts