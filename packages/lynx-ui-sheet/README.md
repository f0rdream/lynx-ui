# @lynx-js/lynx-ui-sheet

A directional Sheet component for ReactLynx. It supports bottom-sheet and side-drawer semantics with drag interactions and snap point primitives.

## Installation

We strongly recommend installing and using this component through the main `@lynx-js/lynx-ui` package:

```bash
# pnpm (recommended)
pnpm add @lynx-js/lynx-ui

# npm
npm install @lynx-js/lynx-ui

# yarn
yarn add @lynx-js/lynx-ui
```

_(If necessary, you can still install the standalone package via `pnpm add @lynx-js/lynx-ui-sheet`)_

## Usage

The `lynx-ui-sheet` follows a headless composition pattern. You can control its visibility via a `ref` and define its behavior using properties like `side`, `enableRTL`, `snapPoints`, and `initialSnap`.

[View Full Examples](https://github.com/lynx-family/lynx-ui/tree/main/apps/examples/Sheet)

## Component Structure

The `Sheet` component is composed of several specialized sub-components to give you full control over the layout and styling.

```tsx
<SheetRoot>
  <SheetView>
    <SheetBackdrop />
    <SheetContent>
      <SheetHandle />
    </SheetContent>
  </SheetView>
</SheetRoot>
```

- **`SheetRoot`**: The root container that manages the state, side, logical RTL resolution, snap points, and drag logic.
- **`SheetView`**: The viewport container for the sheet components.
- **`SheetBackdrop`**: The dimmed overlay behind the sheet. Can be configured to close the sheet on tap.
- **`SheetContent`**: The actual sliding panel that contains your content.
- **`SheetGestureContent`**: A gesture-runtime backed replacement for
  `SheetContent`, intended for nested scrolling.
- **`SheetHandle`**: (Optional) A draggable visual indicator (usually a small bar) at the top of the sheet content.

## Nested scrolling

Replace only the content layer, then bind `useSheetScrollGesture` to each
native scrolling node:

```tsx
function Results() {
  const scrollGesture = useSheetScrollGesture({
    behavior: 'sheet-first',
    handoffAt: 'max',
  })

  return (
    <list main-thread:gesture={scrollGesture}>
      {/* list items */}
    </list>
  )
}

<SheetRoot snapPoints={['40%', '90%']}>
  <SheetView>
    <SheetBackdrop />
    <SheetGestureContent>
      <SheetHandle />
      <Results />
    </SheetGestureContent>
  </SheetView>
</SheetRoot>
```

The enumerable `behavior` policies are:

- `sheet-first`: expand the Sheet to `handoffAt`, then scroll content; a
  downward drag at the content start collapses the Sheet.
- `content-first`: scroll content first, then expand the Sheet when the content
  reaches its end; a downward drag at the content start collapses the Sheet.
- `content-only`: keep the nested gesture entirely in the content. `disabled`
  remains as a deprecated alias.

`handoffAt` accepts a snap-point index or `'max'`. Set `collapseAtStart={false}`
when a nested region must retain downward drags, such as pull-to-refresh. For a
custom native node, use `main-thread:getScrollBoundary` to normalize edge state;
use `main-thread:resolveOwner` only when the built-in policies cannot express the
handoff. Keep the Sheet pan itself intact so its native gesture relationships
remain valid. `gestureConfig` and `gestureRelations` cover recognition thresholds
and relationships with external gestures.

## About @lynx-js/lynx-ui

This component is part of `@lynx-js/lynx-ui`, a headless UI library officially maintained by the Lynx team, provided as a reference for building flexible, universal, and high-performance ReactLynx components.

## License

[**lynx-ui**](https://github.com/lynx-family/lynx-ui) is [**Apache License 2.0**](./LICENSE) licensed.
