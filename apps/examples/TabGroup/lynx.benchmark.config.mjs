// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { benchmarkReactLynx } from '../../../tools/configs/benchmarkReactLynx.mjs'
import { exampleConfig } from '../../../tools/configs/exampleConfig.mjs'

export default await benchmarkReactLynx(
  exampleConfig(
    {
      TabGroupBenchmarkBaseline: './Benchmark/Baseline.tsx',
      TabGroupBenchmarkWorkaround: './Benchmark/Workaround.tsx',
      TabGroupBenchmarkObject: './Benchmark/Object.tsx',
    },
    { needWeb: false },
  ),
  { motion: true, profile: true },
)
