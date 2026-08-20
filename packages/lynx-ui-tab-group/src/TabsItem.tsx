// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import {
  runOnMainThread,
  useContext,
  useEffect,
  useMainThreadRef,
} from '@lynx-js/react'

import { mtsLog } from '@lynx-js/lynx-ui-common'
import { useMotionValueRefEvent } from '@lynx-js/motion/mini'
import type { LayoutChangeDetailEvent, MainThread } from '@lynx-js/types'

import { TabsContext, useTabsRootContext } from './TabsContext'
import type { TabItemProps } from './types'
import { getIndicatorStyleProperties } from './utils/tabsIndicatorAnimation'
import { calculateIndicatorPosition } from './utils/tabsIndicatorGeometry'

export const TabsItem = (props: TabItemProps) => {
  const { style, className, tabKey, children } = props
  const { selectTab, tabKeyArray } = useContext(
    TabsContext,
  )
  const {
    tabsWidthMapMT,
    indicatorOffsetMT,
    indicatorElementMT,
    hasRenderedIndicatorMT,
    isFirstScreenSyncMT,
    onClickItem,
    selectTarget,
    debugLog,
    enableRTL,
  } = useTabsRootContext()
  const MTSViewRef = useMainThreadRef<MainThread.Element>(null)

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
    runOnMainThread(scrollToCenterMT)(true)
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

  const updateIndicatorPositionMT = () => {
    'main thread'
    const indicatorPosition = calculateIndicatorPosition(
      indicatorOffsetMT.current.get(),
      tabKeyArray,
      tabsWidthMapMT.current.get(),
    )
    if (!indicatorPosition) {
      return
    }

    indicatorElementMT.current?.setStyleProperties(
      getIndicatorStyleProperties(
        indicatorPosition.width,
        indicatorPosition.left,
        enableRTL,
      ),
    )
    hasRenderedIndicatorMT.current = true
  }
  const registerTabWidthMT = (width: number) => {
    'main thread'
    mtsLog(debugLog, '[lynx-ui tabs] registerTabWidthMT', tabKey, width)
    tabsWidthMapMT.current.set({
      ...tabsWidthMapMT.current.get(),
      [tabKey]: width,
    })
    updateIndicatorPositionMT()
  }
  const unregisterTabWidthMT = () => {
    'main thread'
    mtsLog(debugLog, '[lynx-ui tabs] unregisterTabWidthMT', tabKey)
    const nextValue = { ...tabsWidthMapMT.current.get() }
    delete nextValue[tabKey]
    tabsWidthMapMT.current.set(nextValue)
  }

  const onLayoutChange = (e: LayoutChangeDetailEvent<MainThread.Element>) => {
    'main thread'
    const width = e.detail?.width ?? e.params?.width
    if (typeof width !== 'number') {
      return
    }
    registerTabWidthMT(width)
  }

  useEffect(() => {
    return () => {
      runOnMainThread(unregisterTabWidthMT)()
    }
  }, [])

  return (
    <view
      main-thread:ref={MTSViewRef}
      bindtap={onClick}
      className={className}
      style={style}
      main-thread:bindlayoutchange={onLayoutChange}
    >
      {children}
    </view>
  )
}
