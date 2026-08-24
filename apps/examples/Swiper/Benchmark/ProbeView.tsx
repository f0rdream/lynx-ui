// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import type { MainThreadRef } from '@lynx-js/react'
import type { MainThread } from '@lynx-js/types'

interface Props {
  label: string
  probeRef: MainThreadRef<MainThread.Element>
  onTap: () => void
}

export function ProbeView({ label, probeRef, onTap }: Props): JSX.Element {
  return (
    <view
      id='mto-benchmark-probe'
      main-thread:ref={probeRef}
      main-thread:bindtap={onTap}
      style={{
        width: '140px',
        height: '40px',
        backgroundColor: '#8df0cc',
        borderRadius: '8px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <text>{label}</text>
    </view>
  )
}
