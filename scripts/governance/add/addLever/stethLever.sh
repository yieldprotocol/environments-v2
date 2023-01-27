
#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/stEthLever.config.ts
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../shared/deploy.ts
$RUN $HERE/stEthLeverSetup.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts