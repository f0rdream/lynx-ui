// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { root, useRef } from '@lynx-js/react'

import {
  SheetBackdrop,
  SheetGestureContent,
  SheetHandle,
  SheetRoot,
  SheetView,
  useSheetScrollGesture,
} from '@lynx-js/lynx-ui'
import type { SheetRootRef } from '@lynx-js/lynx-ui'

import { TriggerButton } from '../shared/index.js'
import './index.css'

const colors = [
  'var(--primary)',
  'var(--secondary)',
  'var(--paper)',
  'var(--neutral-ambient)',
]

function NestedScrollView() {
  const gesture = useSheetScrollGesture({
    behavior: 'sheet-first',
    handoffAt: 'max',
  })
  return (
    <scroll-view
      className='nested-scroll'
      scroll-orientation='vertical'
      bounces={false}
      main-thread:gesture={gesture}
    >
      {Array.from({ length: 20 }, (_, index) => (
        <view
          className='nested-item'
          style={{ backgroundColor: colors[index % colors.length] }}
          key={index}
        >
          <text>{`ScrollView item ${index + 1}`}</text>
        </view>
      ))}
    </scroll-view>
  )
}

function App() {
  const sheetRef = useRef<SheetRootRef>(null)
  return (
    <view className='demo-container lunaris-dark'>
      <text className='title-text'>Gesture Sheet + ScrollView</text>
      <TriggerButton
        onClick={() => sheetRef.current?.open()}
        text='Open Sheet'
      />
      <SheetRoot ref={sheetRef} snapPoints={['45%', '90%']} initialSnap={0}>
        <SheetView className='sheet-viewport'>
          <SheetBackdrop className='sheet-overlay' />
          <SheetGestureContent
            className='sheet-content'
            innerClassName='gesture-sheet-inner'
          >
            <SheetHandle className='sheet-handle' />
            <NestedScrollView />
          </SheetGestureContent>
        </SheetView>
      </SheetRoot>
    </view>
  )
}

root.render(<App />)
export default App
