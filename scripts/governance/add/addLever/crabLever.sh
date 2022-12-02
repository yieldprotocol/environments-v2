
#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/crabLever.config.ts
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../shared/deploy.ts
$RUN $HERE/crabLeverSetup.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts