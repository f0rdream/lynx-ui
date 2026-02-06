import type { MainThreadRef } from '@lynx-js/react'

import type { MotionValue } from '@lynx-js/motion/mini'

import type { PresenceState } from '@lynx-js/lynx-ui-presence'

import { useSnap } from './useSnap'
import { useSnapTouches } from './useSnapTouches'
import type { SheetTransition } from '../../types'

export interface MotionSnapOptions {
  snapPoints: Array<number | string>
  initialSnap?: number
  rubberBand?: boolean | number | { coeff?: number, max?: number }
  flingEnabled?: boolean
  flingDeceleration?: number
  flingMinVelocity?: number
  snapAnimation?: SheetTransition
  dragDisabled?: boolean
  screenHeight?: number
  dismissThreshold?: number
  enableDragToClose?: boolean
  onSnapChange?: (index: number, value: number) => void
  onDismiss?: () => void
  onBeforeDismiss?: () => void
  onEntered?: () => void
  enterAnimation?: SheetTransition
  exitAnimation?: SheetTransition
  sheetProgress?: MainThreadRef<MotionValue<number>>
  consumeSlideEvent?: [number, number][]
  presenceStateMTRef?: MainThreadRef<PresenceState>
  onUnmount?: () => void
  onResurrected?: () => void
}

const DEFAULT_SNAP_POINTS: Array<number | string> = []
const DEFAULT_TRANSITION: SheetTransition = {
  type: 'spring',
  stiffness: 200,
  damping: 60,
}
// biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
const NOOP = () => {}

export function useMotionSnap({
  snapPoints = DEFAULT_SNAP_POINTS,
  initialSnap = 0,
  rubberBand = true,
  flingEnabled = true,
  flingDeceleration = 2000,
  flingMinVelocity = 200,
  snapAnimation = DEFAULT_TRANSITION,
  dragDisabled = false,
  screenHeight,
  dismissThreshold = 0.15,
  enableDragToClose = true,
  onSnapChange = NOOP,
  onDismiss,
  onBeforeDismiss,
  onEntered,
  enterAnimation,
  exitAnimation,
  sheetProgress,
  consumeSlideEvent,
  presenceStateMTRef,
  onUnmount,
  onResurrected,
}: MotionSnapOptions) {
  const {
    setSheetMTRef,
    snapTo,
    expand,
    collapse,
    close,
    show,
    // internals
    yRef,
    screenHeight: resolvedScreenHeight,
    snapOffsets,
    snapPointValues,
    minOffset,
    sheetHeightMTRef,
    maxOffset,
    getResolvedSnapOffsets,
    getResolvedSnapPointValues,
    handleSheetLayoutChangeMT,
    // Controller exports
    onDragStartMT,
    onDragEndSnapMT,
    onDragEndCloseMT,
  } = useSnap({
    snapPoints,
    initialSnap,
    snapAnimation,
    screenHeight,
    onSnapChange,
    onDismiss,
    onBeforeDismiss,
    onEntered,
    enterAnimation,
    exitAnimation,
    sheetProgress,
    presenceStateMTRef,
    onUnmount,
    onResurrected,
  })

  const { handleTouchStartMT, handleTouchMoveMT, handleTouchEndMT } =
    useSnapTouches({
      dragDisabled,
      rubberBand,
      flingEnabled,
      flingDeceleration,
      flingMinVelocity,
      dismissThreshold,
      enableDragToClose,
      yRef,
      screenHeight: resolvedScreenHeight,
      snapOffsets,
      snapPointValues,
      minOffset,
      maxOffset,
      sheetHeightMTRef,
      getResolvedSnapOffsets,
      getResolvedSnapPointValues,
      consumeSlideEvent,
      // Controller handlers
      onDragStartMT,
      onDragEndSnapMT,
      onDragEndCloseMT,
    })

  return {
    setSheetMTRef,
    handleTouchStartMT,
    handleTouchMoveMT,
    handleTouchEndMT,
    handleSheetLayoutChangeMT,
    snapTo,
    expand,
    collapse,
    close,
    show,
  }
}
