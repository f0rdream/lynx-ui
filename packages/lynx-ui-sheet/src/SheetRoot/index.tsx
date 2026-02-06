import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMainThreadRef,
  useMemo,
  useRef,
  useState,
} from '@lynx-js/react'

import { useMotionValueRef } from '@lynx-js/motion/mini'

import { useMemoizedFn } from '@lynx-js/lynx-ui-common'
import { PresenceState } from '@lynx-js/lynx-ui-presence'

import type { SheetRootProps, SheetTransition } from '../../types'
import { SheetContext } from '../context'
import type { SheetMethods } from '../context'

export interface SheetRootRef {
  snapTo: (
    index: number,
    opts?: { animate?: boolean, snapAnimation?: SheetTransition },
  ) => void
  expand: (
    opts?: { animate?: boolean, snapAnimation?: SheetTransition },
  ) => void
  collapse: (
    opts?: { animate?: boolean, snapAnimation?: SheetTransition },
  ) => void
  close: (
    opts?: { animate?: boolean, snapAnimation?: SheetTransition },
  ) => void
  show: (
    opts?: { animate?: boolean, snapAnimation?: SheetTransition },
  ) => void
}

export const SheetRoot = forwardRef<SheetRootRef, SheetRootProps>(
  (props, ref) => {
    const {
      show,
      defaultShow = false,
      forceMount = false,
      children,
      onOpen,
      onClose,
      onShowChange,
      // Physics
      snapPoints,
      initialSnap,
      onSnapChange: onSnapChangeProp,
      screenHeight,
      // Gesture
      rubberBand,
      dragDisabled,
      dismissThreshold,
      handleOnly,
      enableDragToClose,
      consumeSlideEvent,
    } = props
    const sheetProgress = useMotionValueRef<number>(0)
    const presenceStateMTRef = useMainThreadRef<PresenceState>(
      PresenceState.Left,
    )

    const isControlled = show !== undefined
    const [uncontrolledShow, setUncontrolledShow] = useState<boolean>(
      defaultShow,
    )
    const actualShow = isControlled ? show : uncontrolledShow

    const [mounted, setMounted] = useState<boolean>(
      actualShow ? true : false,
    )

    // Wake up the component if show becomes true
    useEffect(() => {
      if (actualShow && !mounted) {
        setMounted(true)
      }
    }, [actualShow, mounted])

    // Store registered methods from SheetContent
    const sheetMethodsRef = useRef<SheetMethods | null>(null)
    const pendingActionsRef = useRef<Array<() => void>>([])

    const handleShowChange = useMemoizedFn((newShow: boolean) => {
      if (newShow === actualShow) return
      onShowChange?.(newShow)
      if (!isControlled) {
        setUncontrolledShow(newShow)
      }
    })

    const registerMethods = useCallback((methods: SheetMethods | null) => {
      sheetMethodsRef.current = methods
      if (methods && pendingActionsRef.current.length > 0) {
        for (const action of pendingActionsRef.current) {
          action()
        }
        pendingActionsRef.current = []
      }
    }, [])

    // Imperative handle methods
    useImperativeHandle(ref, () => ({
      snapTo: (index, opts) => {
        if (sheetMethodsRef.current) {
          sheetMethodsRef.current.snapTo(index, opts)
        } else if (!mounted) {
          console.warn('[Sheet] snapTo: sheet not open')
        }
      },
      expand: (opts) => {
        if (sheetMethodsRef.current) {
          sheetMethodsRef.current.expand(opts)
        } else if (!mounted) {
          console.warn('[Sheet] expand: sheet not open')
        }
      },
      collapse: (opts) => {
        if (sheetMethodsRef.current) {
          sheetMethodsRef.current.collapse(opts)
        } else if (!mounted) {
          console.warn('[Sheet] collapse: sheet not open')
        }
      },
      close: (opts) => {
        if (sheetMethodsRef.current) {
          sheetMethodsRef.current.close(opts)
        } else if (!mounted) {
          // Sheet already closed, no-op
        }
      },
      show: (opts) => {
        handleShowChange(true)

        if (mounted) {
          sheetMethodsRef.current?.show?.(opts)
        } else {
          setMounted(true)
          pendingActionsRef.current.push(() => {
            sheetMethodsRef.current?.show?.(opts)
          })
        }
      },
    }), [handleShowChange, mounted])

    const contextValue = useMemo(() => ({
      show: actualShow,
      forceMount,
      setUncontrolledShow,
      groupState: PresenceState.Entered, // Obsolete, keeping for type/compat if needed or remove
      mounted,
      onUnmount: () => {
        setMounted(false)
      },
      onOpen,
      onClose,
      onShowChange: handleShowChange,
      sheetProgress,
      registerMethods,
      // Physics
      snapPoints,
      initialSnap,
      onSnapChange: onSnapChangeProp,
      screenHeight,
      // Gesture
      rubberBand,
      dragDisabled,
      dismissThreshold,
      handleOnly,
      enableDragToClose,
      presenceStateMTRef,
      consumeSlideEvent,
    }), [
      actualShow,
      forceMount,
      setUncontrolledShow,
      mounted,
      onOpen,
      onClose,
      handleShowChange,
      sheetProgress,
      registerMethods,
      snapPoints,
      initialSnap,
      onSnapChangeProp,
      screenHeight,
      rubberBand,
      dragDisabled,
      dismissThreshold,
      handleOnly,
      enableDragToClose,
      presenceStateMTRef,
      consumeSlideEvent,
    ])

    return (
      <SheetContext.Provider value={contextValue}>
        {children}
      </SheetContext.Provider>
    )
  },
)
