// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { MotionValue } from '@lynx-js/motion'
import {
  defineMainThreadObjectType,
  root,
  useMainThreadObject,
  useMainThreadRef,
} from '@lynx-js/react'
import type { MainThread } from '@lynx-js/types'

import { SwiperBenchmarkPage } from './Page'
import { motionValue } from './MotionRuntime' with { runtime: 'shared' }
import { ProbeView } from './ProbeView'
import { StopAfterHydration } from './Stop'

const motionValueType = defineMainThreadObjectType<number, MotionValue<number>>(
  {
    type: '@lynx-js/benchmark/SwiperMotionValue',
    create(initialValue) {
      'main thread'
      return motionValue(initialValue)
    },
  },
)

function App(): JSX.Element {
  const probeRef = useMainThreadRef<MainThread.Element>(null)
  const value = useMainThreadObject(motionValueType, 1)

  function onTap() {
    'main thread'
    const next = value.get() === 1 ? 1.1 : 1
    value.set(next)
    probeRef.current?.setStyleProperties({ transform: `scale(${next})` })
  }

  return (
    <SwiperBenchmarkPage
      probe={<ProbeView label='Object' probeRef={probeRef} onTap={onTap} />}
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
