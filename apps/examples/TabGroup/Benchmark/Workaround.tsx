// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { MotionValue } from '@lynx-js/motion'
import {
  root,
  runOnMainThread,
  useMainThreadRef,
  useMemo,
} from '@lynx-js/react'
import { runWorkletCtx } from '@lynx-js/react/worklet-runtime/bindings'
import type { MainThread } from '@lynx-js/types'

import { motionValue } from './MotionRuntime' with { runtime: 'shared' }
import { TabGroupBenchmarkPage } from './Page'
import { ProbeView } from './ProbeView'
import { StopAfterHydration } from './Stop'

function App(): JSX.Element {
  const probeRef = useMainThreadRef<MainThread.Element>(null)
  const valueRef = useMainThreadRef<MotionValue<number>>(null)

  function initializeValue() {
    'main thread'
    valueRef.current = motionValue(1)
  }

  useMemo(() => {
    if (__BACKGROUND__) {
      void runOnMainThread(initializeValue)()
    } else {
      runWorkletCtx(initializeValue, [])
    }
  }, [])

  function onTap() {
    'main thread'
    const value = valueRef.current
    if (!value) return
    const next = value.get() === 1 ? 1.1 : 1
    value.set(next)
    probeRef.current?.setStyleProperties({ transform: `scale(${next})` })
  }

  return (
    <TabGroupBenchmarkPage
      probe={
        <ProbeView label='Ref workaround' probeRef={probeRef} onTap={onTap} />
      }
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
