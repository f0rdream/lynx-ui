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

function NestedList() {
  const gesture = useSheetScrollGesture({ behavior: 'sheet-first' })
  return (
    <list
      className='nested-list'
      scroll-orientation='vertical'
      list-type='single'
      span-count={1}
      bounces={false}
      main-thread:gesture={gesture}
    >
      {Array.from(
        { length: 30 },
        (_, index) => (
          <list-item item-key={`item-${index}`} key={index}>
            <view className='list-item'>
              <text>{`List item ${index + 1}`}</text>
            </view>
          </list-item>
        ),
      )}
    </list>
  )
}

function App() {
  const sheetRef = useRef<SheetRootRef>(null)
  return (
    <view className='demo-container lunaris-dark'>
      <text className='title-text'>Gesture Sheet + List</text>
      <TriggerButton
        onClick={() => sheetRef.current?.open()}
        text='Open Sheet'
      />
      <SheetRoot ref={sheetRef} snapPoints={['40%', '90%']} initialSnap={0}>
        <SheetView className='sheet-viewport'>
          <SheetBackdrop className='sheet-overlay' />
          <SheetGestureContent
            className='sheet-content'
            innerClassName='gesture-sheet-inner'
          >
            <SheetHandle className='sheet-handle' />
            <NestedList />
          </SheetGestureContent>
        </SheetView>
      </SheetRoot>
    </view>
  )
}

root.render(<App />)
export default App
