// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { useRef, useState } from '@lynx-js/react'

import { Swiper, SwiperItem } from '@lynx-js/lynx-ui-swiper'
import type { SwiperRef } from '@lynx-js/lynx-ui-swiper'

import { Button } from '../Common/Button'
import { Card } from '../Common/Card'
import { Indicator } from '../Common/Indicator'

import '../Basic/styles.css'

const itemArr = [1, 2, 3, 4, 5]
const itemWidths = [250, 350, 400]
const alignArr: ['start', 'center', 'end'] = ['start', 'center', 'end']
const INITIAL_INDEX = 2

interface Props {
  probe: JSX.Element
}

export function SwiperBenchmarkPage({ probe }: Props): JSX.Element {
  const [itemWidthsIndex, setItemWidthsIndex] = useState(0)
  const [alignIndex, setAlignIndex] = useState(1)
  const [currentIndex, setCurrentIndex] = useState(INITIAL_INDEX)
  const swiperRef = useRef<SwiperRef>(null)

  return (
    <view className='demo-container lunaris-dark'>
      <view className='top-area' />
      {probe}
      <view className='content-area'>
        <Swiper
          ref={swiperRef}
          data={itemArr}
          itemWidth={itemWidths[itemWidthsIndex] ?? 0}
          containerWidth={1048}
          duration={500}
          initialIndex={INITIAL_INDEX}
          onChange={setCurrentIndex}
          mode='normal'
          modeConfig={{
            align: alignArr[alignIndex],
            spaceBetween: 16,
          }}
          autoPlay={false}
          style={{ overflow: 'visible' }}
        >
          {({ index }) => (
            <SwiperItem>
              <Card index={index} style={{ height: '250px' }} />
            </SwiperItem>
          )}
        </Swiper>
        <Indicator current={currentIndex} count={itemArr.length} />
      </view>
      <view className='operation'>
        <Button
          onClick={() => swiperRef.current?.swipePrev()}
          className='expand'
          text='SwipePrev'
        />
        <Button
          onClick={() => swiperRef.current?.swipeNext()}
          className='expand'
          type='primary'
          text='SwipeNext'
        />
      </view>
      <view className='sub-operation'>
        <Button
          onClick={() =>
            setItemWidthsIndex(previous => (previous + 1) % itemWidths.length)}
          text='Change Item Width'
          subText={`ItemWidth: ${itemWidths[itemWidthsIndex]}`}
        />
        <Button
          onClick={() =>
            setAlignIndex(previous => (previous + 1) % alignArr.length)}
          text='Change Align Type'
          subText={`AlignType: ${alignArr[alignIndex]}`}
        />
      </view>
    </view>
  )
}
