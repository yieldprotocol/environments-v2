
#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/strategyLever.config.ts
RUN="npx hardhat run --network localhost"

$RUN $HERE/../../../../shared/deploy.ts
$RUN $HERE/strategyLeverAndGiverSetup.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts