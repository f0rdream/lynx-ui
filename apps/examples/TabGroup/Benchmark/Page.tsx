// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { useState } from '@lynx-js/react'

import {
  TabsBar,
  TabsIndicator,
  TabsItem,
  TabsRoot,
} from '@lynx-js/lynx-ui-tab-group'
import type { TabsData } from '@lynx-js/lynx-ui-tab-group'

import '../Basic/index.css'

const tabsArray = ['Home', 'Discover', 'Messages', 'Profile']

interface Props {
  probe: JSX.Element
}

export function TabGroupBenchmarkPage({ probe }: Props): JSX.Element {
  const [tabs] = useState<TabsData<string>[]>(
    Array.from({ length: tabsArray.length }, (_, index) => ({
      tabItem: tabsArray[index],
      getTabKey: () => tabsArray[index],
    })),
  )

  return (
    <view className='tab-group-demo-basic'>
      <text className='tab-group-demo-basic__title'>TabGroup</text>
      {probe}
      <TabsRoot
        onClickItem={index => console.info('tabs click', index)}
        onTabChanged={index => console.info('tabs changed', index)}
      >
        <TabsBar
          data={tabs}
          className='tab-group-demo-basic__tabs'
          renderTabItem={(tabItemData: TabsData<string>) => (
            <TabsItem
              className='tab-group-demo-basic__tab-item'
              tabKey={tabItemData.getTabKey()}
            >
              <text>{tabItemData.tabItem}</text>
            </TabsItem>
          )}
        >
          <TabsIndicator className='tab-group-demo-basic__indicator'>
            <view className='tab-group-demo-basic__indicator-line' />
          </TabsIndicator>
        </TabsBar>
      </TabsRoot>
    </view>
  )
}
