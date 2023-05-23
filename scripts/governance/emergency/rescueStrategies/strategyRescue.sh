
#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/strategyRecovery.config.ts
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../shared/deploy.ts
$RUN $HERE/rescueStrategies.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts