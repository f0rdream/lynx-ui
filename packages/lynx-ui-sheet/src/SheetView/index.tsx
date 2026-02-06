import { OverlayView } from '@lynx-js/lynx-ui-overlay'

import type { SheetViewProps } from '../../types'
import { useSheetContext } from '../context'

export const SheetView = (props: SheetViewProps) => {
  const {
    container,
    children,
    className,
    style,
    overlayLevel,
    sheetViewProps,
  } = props

  const { mounted, forceMount } = useSheetContext()

  if (!mounted && !forceMount) {
    return null
  }

  return (
    <OverlayView
      container={container}
      className={className}
      style={{
        ...style,
        position: container ? 'relative' : 'fixed',
      }}
      overlayLevel={overlayLevel}
      overlayViewProps={sheetViewProps}
    >
      {children}
    </OverlayView>
  )
}
