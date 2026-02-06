import { runOnBackground, useMainThreadRef } from '@lynx-js/react'

import { useMotionValueRefEvent } from '@lynx-js/motion/mini'
import { clsx } from 'clsx'

import { useMemoizedFn } from '@lynx-js/lynx-ui-common'
import { PresenceState } from '@lynx-js/lynx-ui-presence'
import type { MainThread } from '@lynx-js/types'

import type { SheetBackdropProps } from '../../types'
import { useSheetContext } from '../context'

import './styles.css'

export function SheetBackdrop(props: SheetBackdropProps) {
  const { clickToClose = true, onClick, children, style, className } = props
  const {
    sheetProgress,
    setUncontrolledShow,
    onShowChange,
    presenceStateMTRef,
  } = useSheetContext()
  const overlayMTRef = useMainThreadRef<MainThread.Element>(null)

  useMotionValueRefEvent(sheetProgress, 'change', (v) => {
    'main thread'
    overlayMTRef.current?.setStyleProperties({
      opacity: String(v),
    })
  })

  const handleClick = useMemoizedFn(() => {
    // onShowChange triggers the close animation flow via handleShowChange in SheetRoot
    onShowChange?.(false)
    // setUncontrolledShow updates state for uncontrolled mode
    setUncontrolledShow(false)
    onClick?.()
  })

  function handleClickMT() {
    'main thread'
    if (
      presenceStateMTRef
      && presenceStateMTRef.current !== PresenceState.Entered
    ) {
      return
    }

    if (!clickToClose) {
      return
    }

    runOnBackground(handleClick)()
  }

  return (
    <view
      main-thread:ref={overlayMTRef}
      className={clsx('lynx-ui-sheet-backdrop', className)}
      main-thread:bindtap={handleClickMT}
      event-through={false}
      style={style}
    >
      {children}
    </view>
  )
}
