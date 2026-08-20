# @lynx-js/lynx-ui-tab-group

Composable tab primitives for building tab navigation with Lynx UI. The package provides `TabsRoot`, `TabsBar`, `TabsItem`, and `TabsIndicator`.

## Installation

```bash
pnpm add @lynx-js/lynx-ui
```

## Basic usage

```tsx
import { root } from '@lynx-js/react'
import {
  TabsBar,
  TabsIndicator,
  TabsItem,
  TabsRoot,
} from '@lynx-js/lynx-ui'
import type { TabsData } from '@lynx-js/lynx-ui'
import './index.css'

const tabs: TabsData<string>[] = [
  { tabItem: 'Home', getTabKey: () => 'home' },
  { tabItem: 'Profile', getTabKey: () => 'profile' },
]

export function App() {
  return (
    <TabsRoot>
      <TabsBar
        data={tabs}
        renderTabItem={item => (
          <TabsItem tabKey={item.getTabKey()}>
            <text>{item.tabItem}</text>
          </TabsItem>
        )}
      >
        <TabsIndicator />
      </TabsBar>
    </TabsRoot>
  )
}

root.render(<App />)
```

See the [TabGroup examples](https://github.com/lynx-family/lynx-ui/tree/main/apps/examples/TabGroup) for complete examples.

## License

Apache-2.0
