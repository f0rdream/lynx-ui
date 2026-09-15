// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import {
  forwardRef,
  runOnBackground,
  runOnMainThread,
  useImperativeHandle,
  useMainThreadRef,
  useMemo,
} from '@lynx-js/react'

import { useMotionValueRef } from '@lynx-js/motion/mini'

import { TabsRootContext } from './TabsContext'
import type { TabsRootProps, TabsRootRef } from './types'

function useDataSubscript(initValue: number) {
  const tabsWidthMapMT = useMotionValueRef<Record<string, number>>({})
  const tabRegistrationMapMT = useMainThreadRef<Record<string, number>>({})
  const indicatorOffsetMT = useMotionValueRef<number>(initValue)
  const selectTarget = useMotionValueRef<{ index: number, smooth: boolean }>({
    index: initValue,
    smooth: false,
  })

  return {
    tabsWidthMapMT,
    tabRegistrationMapMT,
    indicatorOffsetMT,
    selectTarget,
  }
}

export const TabsRoot = forwardRef<TabsRootRef, TabsRootProps>((props, ref) => {
  const {
    initialSelectIndex = 0,
    debugLog = false,
    children,
    onClickItem,
    onTabChanged,
    selectBehavior = 'smooth',
    indicatorAnimation,
    enableRTL = false,
  } = props
  const {
    tabsWidthMapMT,
    tabRegistrationMapMT,
    indicatorOffsetMT,
    selectTarget,
  } = useDataSubscript(initialSelectIndex)

  const onTabChangedJS = (index: number) => {
    onTabChanged?.(index)
  }
  const selectTabMT = (target: { index: number, smooth: boolean }) => {
    'main thread'
    if (selectTarget.current.get().index === target.index) {
      return
    }
    selectTarget.current.set(target)
    runOnBackground(onTabChangedJS)(target.index)
  }
  const selectTabByIndex = (index: number) => {
    runOnMainThread(selectTabMT)({
      index,
      smooth: selectBehavior !== 'instant',
    })
  }

  const unregisterTabWidthMT = (tabKey: string, registrationId: number) => {
    'main thread'
    if (tabRegistrationMapMT.current[tabKey] !== registrationId) {
      return
    }
    const nextValue = { ...tabsWidthMapMT.current.get() }
    delete nextValue[tabKey]
    tabsWidthMapMT.current.set(nextValue)
    delete tabRegistrationMapMT.current[tabKey]
  }
  const unregisterTabWidth = (tabKey: string, registrationId: number) => {
    runOnMainThread(unregisterTabWidthMT)(tabKey, registrationId)
  }

  const tabsRootContextValue = useMemo(
    () => ({
      debugLog,
      enableRTL,
      selectBehavior,
      indicatorAnimation,
      initialSelectIndex,
      tabsWidthMapMT,
      tabRegistrationMapMT,
      indicatorOffsetMT,
      selectTabByIndex,
      unregisterTabWidth,
      onClickItem,
      selectTarget,
    }),
    [
      debugLog,
      enableRTL,
      selectBehavior,
      indicatorAnimation,
      initialSelectIndex,
      onClickItem,
      tabsWidthMapMT,
      tabRegistrationMapMT,
      indicatorOffsetMT,
      selectTabByIndex,
      unregisterTabWidth,
      selectTarget,
    ],
  )

  useImperativeHandle(ref, () => ({
    selectTab: (index: number, smooth: boolean) => {
      runOnMainThread(selectTabMT)({ index, smooth })
    },
  }))

  return (
    <TabsRootContext.Provider value={tabsRootContextValue}>
      {children}
    </TabsRootContext.Provider>
  )
})
