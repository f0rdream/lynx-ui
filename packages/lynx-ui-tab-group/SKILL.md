# Lynx UI TabGroup SKILL

## Core Capabilities

`@lynx-js/lynx-ui-tab-group` provides composable tab-navigation primitives: `TabsRoot`, `TabsBar`, `TabsItem`, and `TabsIndicator`.

## Minimal Usable Example

```tsx
<TabsRoot>
  <TabsBar data={tabs} renderTabItem={item => (
    <TabsItem tabKey={item.getTabKey()}>
      <text>{item.tabItem}</text>
    </TabsItem>
  )}>
    <TabsIndicator />
  </TabsBar>
</TabsRoot>
```

## Best Practices

- Give every item a stable, unique value from `getTabKey`.
- Render `TabsIndicator` as a child of `TabsBar`.
- Use `onTabChanged` or `TabsRootRef.selectTab` to coordinate externally rendered content.
- Configure `indicatorAnimation` on `TabsRoot` for custom indicator motion.
