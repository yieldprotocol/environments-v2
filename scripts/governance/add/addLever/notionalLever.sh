
#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/notionalLever.config.ts
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../shared/deploy.ts
$RUN $HERE/notionalLeverSetup.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
# $RUN $HERE/notionalLever.test.ts