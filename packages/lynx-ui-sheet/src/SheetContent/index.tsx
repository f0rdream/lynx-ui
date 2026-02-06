import { useEffect, useMemo, useRef } from '@lynx-js/react'

import { clsx } from 'clsx'

import { useMemoizedFn } from '@lynx-js/lynx-ui-common'

import type { SheetContentProps } from '../../types'
import { SheetDragContext, useSheetContext } from '../context'
import { useMotionSnap } from '../hooks'

import './styles.css'

export function SheetContent(props: SheetContentProps) {
  const {
    snapAnimation,
    children,
    enterAnimation,
    exitAnimation,
    className,
    ...rest
  } = props

  const {
    sheetProgress,
    registerMethods,
    snapPoints = [],
    initialSnap = 0,
    rubberBand,
    dragDisabled,
    dismissThreshold,
    handleOnly,
    enableDragToClose = true,
    screenHeight,
    onSnapChange,
    onShowChange,
    consumeSlideEvent,
    presenceStateMTRef,
    onUnmount,
    onOpen,
    onClose,
  } = useSheetContext()

  // Track if show state changes are internal (from controller) vs external (from prop/context)
  const isInternalChangeRef = useRef(false)

  const handleBeforeDismiss = useMemoizedFn(() => {
    isInternalChangeRef.current = true
    onShowChange?.(false)
  })

  const handleDismissed = useMemoizedFn(() => {
    onClose?.()
  })

  const handleEntered = useMemoizedFn(() => {
    onOpen?.()
  })

  // Handle resurrection - when user drags during close animation
  const handleResurrected = useMemoizedFn(() => {
    isInternalChangeRef.current = true
    onShowChange?.(true)
  })

  const {
    setSheetMTRef,
    handleTouchStartMT,
    handleTouchMoveMT,
    handleTouchEndMT,
    handleSheetLayoutChangeMT,
    snapTo,
    expand,
    collapse,
    close,
    show: showSheet,
  } = useMotionSnap({
    snapPoints,
    initialSnap,
    rubberBand,
    snapAnimation,
    dragDisabled,
    dismissThreshold,
    onSnapChange,
    enableDragToClose,
    screenHeight,
    onBeforeDismiss: handleBeforeDismiss,
    onDismiss: handleDismissed,
    onEntered: handleEntered,
    onResurrected: handleResurrected,
    enterAnimation,
    exitAnimation,
    sheetProgress,
    consumeSlideEvent,
    presenceStateMTRef,
    onUnmount,
  })

  // Get show state from context
  const { show: showFromContext } = useSheetContext()

  // Track previous show state to detect changes
  // Initialize to false to ensure controlled mode mounts trigger showSheet()
  const prevShowRef = useRef(false)

  // React to show changes from context (e.g., controlled mode, backdrop click)
  // Only act on EXTERNAL changes, not internal state updates from controller
  useEffect(() => {
    if (prevShowRef.current !== showFromContext) {
      if (isInternalChangeRef.current) {
        // Internal change from controller - skip, already handled
        isInternalChangeRef.current = false
      } else {
        // External change - trigger show/close
        if (showFromContext) {
          showSheet()
        } else {
          close()
        }
      }
      prevShowRef.current = showFromContext
    }
  }, [showFromContext, showSheet, close])

  // Register methods with SheetRoot on mount, unregister on unmount
  useEffect(() => {
    registerMethods({
      snapTo,
      expand,
      collapse,
      close,
      show: showSheet,
    })
    return () => {
      registerMethods(null)
    }
  }, [registerMethods, snapTo, expand, collapse, close, showSheet])

  const contextValue = useMemo(
    () => ({
      dragHandlers: {
        handleTouchStartMT,
        handleTouchMoveMT,
        handleTouchEndMT,
      },
    }),
    [handleTouchStartMT, handleTouchMoveMT, handleTouchEndMT],
  )

  return (
    <view
      className={clsx(className, 'lynx-ui-sheet-surface')}
      main-thread:ref={setSheetMTRef}
      implicit-animation='false'
      event-through={false}
      main-thread:bindtouchstart={handleOnly ? undefined : handleTouchStartMT}
      main-thread:bindtouchmove={handleOnly ? undefined : handleTouchMoveMT}
      main-thread:bindtouchend={handleOnly ? undefined : handleTouchEndMT}
    >
      <view
        {...rest}
        className={clsx(className, 'lynx-ui-sheet-content')}
        main-thread:bindlayoutchange={handleSheetLayoutChangeMT}
      >
        <SheetDragContext.Provider value={contextValue}>
          {children}
        </SheetDragContext.Provider>
      </view>
    </view>
  )
}
