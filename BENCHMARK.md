# MainThreadObject benchmark on lynx-ui pages

This fixture measures `MainThreadObject` on two existing lynx-ui examples:
Swiper Basic and TabGroup Basic. It is a one-time design comparison, not a
permanent performance regression suite.

## Revisions

- lynx-ui source: `3c98927864d926588d51d0d708977dba625b08e8`
- lynx-stack comparison parent: `d8f80cd019ecafddbacb7749e16a3eb293b28727`
- lynx-stack implementation: `2c05c4e5acaa1b6f8b1af2b4b2ead2664191ed83`

Both lynx-stack revisions were fully built before the lynx-ui bundles were
created. The benchmark configuration pins Rspeedy, the ReactLynx compiler and
runtime, and Motion to the selected `LYNX_STACK_ROOT`. It also compiles the
lynx-ui components from this checkout's source.

## Compared pages

The unchanged-page comparison builds the existing Swiper Basic and TabGroup
Basic entries at the parent and implementation revisions. Neither page imports
or uses `MainThreadObject`.

The reactive comparison keeps each real component tree and inserts the same
140 x 40 probe in three variants:

1. A numeric `MainThreadRef` baseline without Motion.
2. A real `motion-dom` MotionValue created after mount and stored in a
   `MainThreadRef`.
3. The same real MotionValue created through `MainThreadObject`.

The workaround is:

```tsx
const valueRef = useMainThreadRef<MotionValue<number>>(null)

function initializeValue() {
  'main thread'
  valueRef.current = motionValue(1)
}

useEffect(() => {
  void runOnMainThread(initializeValue)()
}, [])

function onTap() {
  'main thread'
  const value = valueRef.current
  if (!value) return
  const next = value.get() === 1 ? 1.1 : 1
  value.set(next)
  probeRef.current?.setStyleProperties({ transform: `scale(${next})` })
}
```

The direct-object variant is:

```tsx
const motionValueType = defineMainThreadObjectType<number, MotionValue<number>>({
  type: '@lynx-js/benchmark/MotionValue',
  create(initialValue) {
    'main thread'
    return motionValue(initialValue)
  },
})

const value = useMainThreadObject(motionValueType, 1)

function onTap() {
  'main thread'
  const next = value.get() === 1 ? 1.1 : 1
  value.set(next)
  probeRef.current?.setStyleProperties({ transform: `scale(${next})` })
}
```

Both variants use Motion's packaged shared-runtime adapter:

```ts
import '@lynx-js/motion/dist/polyfill/shim.js'
export { motionValue } from '@lynx-js/motion/dist/polyfill/MotionValue.js'
```

## Build procedure

Use Node.js 24 and the repository-pinned pnpm version. Build each exact
lynx-stack checkout first, then build from each example directory:

```sh
LYNX_STACK_ROOT=/absolute/path/to/lynx-stack \
  pnpm exec rspeedy build --config lynx.baseline-benchmark.config.mjs

LYNX_STACK_ROOT=/absolute/path/to/lynx-stack \
  pnpm exec rspeedy build --config lynx.benchmark.config.mjs
```

The first command produces the unchanged Basic page. The second produces the
baseline, workaround, and object bundles. Bundle sizes are exact filesystem
bytes and `gzip -9 -c` bytes.

## Bundle results

| Page and variant | Raw | gzip -9 |
| --- | ---: | ---: |
| Swiper parent unchanged | 179,979 B | 69,951 B |
| Swiper implementation unchanged | 184,484 B | 72,083 B |
| Swiper probe baseline | 185,949 B | 72,687 B |
| Swiper workaround | 275,835 B | 113,692 B |
| Swiper object | 281,454 B | 115,799 B |
| TabGroup parent unchanged | 208,187 B | 82,822 B |
| TabGroup implementation unchanged | 212,701 B | 84,926 B |
| TabGroup probe baseline | 214,105 B | 85,521 B |
| TabGroup workaround | 300,868 B | 123,914 B |
| TabGroup object | 306,481 B | 125,875 B |

The unchanged implementation adds 2,132 B gzip to Swiper and 2,104 B gzip to
TabGroup. On the reactive pages, the object variant adds 2,107 B gzip over the
workaround for Swiper and 1,961 B gzip for TabGroup. Most reactive bundle cost
is common Motion runtime: the workaround already adds 41,005 B gzip over the
Swiper probe baseline and 38,393 B gzip over the TabGroup probe baseline.

## Real-device procedure

- OSS LynxExplorer (`com.lynx.explorer`) on one Android 10 `aries_10` sandbox
  device.
- Production bundles served from one local HTTP server through ADB reverse.
- Startup traces captured before page open with Agent Lynx/Perfetto.
- Five complete counterbalanced cycles, each containing all eight unchanged and
  reactive conditions.
- Thirty probe taps per reactive implementation. Update latency is the Perfetto
  duration of `TouchEventHandler::TriggerFiberElementWorklet`.

The probe rendered without console errors in all four reactive pages. A tap on
each workaround and object page changed the native style to:

```text
transform: scale(1.1,1.1)
```

## Startup results

All figures are medians in milliseconds, with `n=5` complete cycles per
condition. Load to FMP is `FirstMeaningfulPaint - StartLoad`. Initial and
hydration MTS use the first and second `mtsRenderStart`/`mtsRenderEnd` pairs.
Background load is `loadBackgroundEnd - loadBackgroundStart`.

| Condition | Load to FMP | Initial MTS | Hydration MTS | Background load |
| --- | ---: | ---: | ---: | ---: |
| Swiper parent | 44.200 | 22.440 | 22.012 | 27.713 |
| Swiper implementation | 52.009 | 29.713 | 23.318 | 24.710 |
| TabGroup parent | 28.310 | 8.182 | 2.328 | 26.961 |
| TabGroup implementation | 24.327 | 8.267 | 2.285 | 26.152 |
| Swiper workaround | 49.349 | 28.159 | 23.681 | 29.675 |
| Swiper object | 46.035 | 26.343 | 25.891 | 27.500 |
| TabGroup workaround | 31.568 | 14.355 | 2.850 | 25.555 |
| TabGroup object | 26.229 | 9.749 | 2.810 | 29.547 |

Swiper's unchanged page has a `+7.8 ms` median FMP signal while TabGroup moves
in the opposite direction by `-4.0 ms`. The object variant has a lower median
FMP than the workaround on both pages. With only five cycles, high run/order
variance, and conflicting unchanged-page directions, these results establish
neither a startup regression nor an improvement. They are signals for a
longer-term regression workload.

Three later attempted cycles were excluded because the trace stream closed
before `Tracing.tracingComplete`; incomplete traces were not used.

## Update results

| Page and implementation | Mean | p50 | p95 |
| --- | ---: | ---: | ---: |
| Swiper workaround | 1.368 ms | 1.322 ms | 1.579 ms |
| Swiper object | 1.347 ms | 1.295 ms | 1.473 ms |
| TabGroup workaround | 1.349 ms | 1.284 ms | 1.740 ms |
| TabGroup object | 1.356 ms | 1.303 ms | 1.548 ms |

This run shows no measured steady-state update penalty from
`MainThreadObject`.
