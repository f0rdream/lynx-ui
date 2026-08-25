// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { root, useMainThreadRef } from '@lynx-js/react'
import type { MainThread } from '@lynx-js/types'

import { SwiperBenchmarkPage } from './Page'
import { ProbeView } from './ProbeView'
import { StopAfterHydration } from './Stop'

function App(): JSX.Element {
  const probeRef = useMainThreadRef<MainThread.Element>(null)
  const valueRef = useMainThreadRef(1)

  function onTap() {
    'main thread'
    const next = valueRef.current === 1 ? 1.1 : 1
    valueRef.current = next
    probeRef.current?.setStyleProperties({ transform: `scale(${next})` })
  }

  return (
    <SwiperBenchmarkPage
      probe={<ProbeView label='Baseline' probeRef={probeRef} onTap={onTap} />}
    />
  )
}

runAfterLoadScript(() => {
  root.render(
    <>
      <App />
      <StopAfterHydration />
    </>,
  )
})
