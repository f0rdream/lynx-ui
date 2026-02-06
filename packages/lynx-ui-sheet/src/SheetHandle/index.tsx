import type { SheetHandleProps } from '../../types'
import { useSheetDragContext } from '../context'

export function SheetHandle(props: SheetHandleProps) {
  const { className, style, ...rest } = props
  const { dragHandlers } = useSheetDragContext()

  return (
    <view
      className={className}
      style={style}
      main-thread:bindtouchstart={dragHandlers.handleTouchStartMT}
      main-thread:bindtouchmove={dragHandlers.handleTouchMoveMT}
      main-thread:bindtouchend={dragHandlers.handleTouchEndMT}
      {...rest}
    />
  )
}
