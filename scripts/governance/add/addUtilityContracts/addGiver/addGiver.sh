
#!/bin/bash

set -eux
HERE=$(dirname $0)
export CONF=$PWD/$HERE/addGiver.config.ts
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../shared/deploy.ts
$RUN $HERE/addGiver.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts
$RUN $HERE/giver.test.ts