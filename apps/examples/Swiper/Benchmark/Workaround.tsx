// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { MotionValue } from '@lynx-js/motion'
import {
  root,
  runOnMainThread,
  useEffect,
  useMainThreadRef,
} from '@lynx-js/react'
import type { MainThread } from '@lynx-js/types'

import { SwiperBenchmarkPage } from './Page'
import { motionValue } from './MotionRuntime' with { runtime: 'shared' }
import { ProbeView } from './ProbeView'

function App(): JSX.Element {
  const probeRef = useMainThreadRef<MainThread.Element>(null)
  const valueRef = useMainThreadRef<MotionValue<number>>(null)

  function initializeValue() {
    'main thread'
    valueRef.current = motionValue(1)
  }

  useEffect(() => {
    void runOnMainThread(initializeValue)()
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
    <SwiperBenchmarkPage
      probe={
        <ProbeView label='Ref workaround' probeRef={probeRef} onTap={onTap} />
      }
    />
  )
}

root.render(<App />)
