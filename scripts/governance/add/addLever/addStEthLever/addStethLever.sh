
#!/bin/bash

set -eux
export HERE=$(dirname $0)
export CONF=$PWD/$HERE/addStethLever.config.ts
RUN="npx hardhat run --network tenderly"

$RUN $HERE/../../../../shared/deploy.ts
$RUN $HERE/addStethLever.ts
$RUN $HERE/../../../../shared/approve.ts
$RUN $HERE/../../../../shared/execute.ts