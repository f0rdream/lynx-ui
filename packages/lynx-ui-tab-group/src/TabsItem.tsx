// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import {
  runOnMainThread,
  useEffect,
  useMainThreadRef,
  useMemo,
} from '@lynx-js/react'

import { getEventDetail } from '@lynx-js/lynx-ui-common'
import { useMotionValueRefEvent } from '@lynx-js/motion/mini'
import type { LayoutChangeEvent, MainThread } from '@lynx-js/types'

import { useTabsContext, useTabsRootContext } from './TabsContext'
import type { TabItemProps } from './types'

let nextTabRegistrationId = 0

export const TabsItem = (props: TabItemProps) => {
  const { style, className, tabKey, children, ...viewProps } = props
  const { selectTab, tabKeyArray } = useTabsContext()
  const {
    onClickItem,
    selectTarget,
    selectBehavior,
    registerTabWidth,
    unregisterTabWidth,
  } = useTabsRootContext()
  const MTSViewRef = useMainThreadRef<MainThread.Element>(null)
  const isFirstScreenSyncMT = useMainThreadRef<boolean>(true)
  const tabRegistrationId = useMemo(() => nextTabRegistrationId++, [tabKey])

  const scrollToCenterMT = (smooth = true) => {
    'main thread'
    MTSViewRef.current?.invoke('scrollIntoView', {
      scrollIntoViewOptions: {
        block: 'center',
        inline: 'center',
        ...(smooth ? { behavior: 'smooth' } : {}),
      },
    })
  }

  const scrollToCenterAfterInitialAlignmentMT = (smooth: boolean) => {
    'main thread'
    const shouldSmooth = !isFirstScreenSyncMT.current && smooth
    scrollToCenterMT(shouldSmooth)
  }

  const onClick = () => {
    runOnMainThread(scrollToCenterMT)(selectBehavior !== 'instant')
    selectTab(tabKey)
    onClickItem?.(tabKeyArray.indexOf(tabKey))
  }

  useMotionValueRefEvent(
    selectTarget,
    'change',
    (target: { index: number, smooth: boolean }) => {
      'main thread'
      if (tabKey === tabKeyArray[target.index]) {
        scrollToCenterAfterInitialAlignmentMT(target.smooth)
      }
    },
  )

  const onLayoutChange = (event: LayoutChangeEvent) => {
    const { width } = getEventDetail(event)
    if (typeof width !== 'number') {
      return
    }
    registerTabWidth(tabKey, width, tabRegistrationId)
  }

  const clearFirstScreenSyncMT = () => {
    'main thread'
    isFirstScreenSyncMT.current = false
  }

  useEffect(() => {
    runOnMainThread(clearFirstScreenSyncMT)()
    return () => {
      unregisterTabWidth(tabKey, tabRegistrationId)
    }
  }, [tabKey, tabRegistrationId])

  return (
    <view
      {...viewProps}
      main-thread:ref={MTSViewRef}
      bindtap={onClick}
      className={className}
      style={style}
      bindlayoutchange={onLayoutChange}
    >
      {children}
    </view>
  )
}
