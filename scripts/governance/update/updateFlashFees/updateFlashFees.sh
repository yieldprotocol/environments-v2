
#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/updateFlashFees.config.ts
RUN="npx hardhat run --network tenderly"

$RUN $HERE/updateFlashFees.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts