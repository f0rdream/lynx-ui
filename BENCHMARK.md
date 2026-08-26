# MainThreadObject benchmark on real lynx-ui pages

This temporary fixture measures the MainThreadObject pull request on the real
Swiper and TabGroup examples. It is a one-time design comparison, not a
permanent lynx-ui performance suite.

## Revisions

- lynx-ui source: `3c98927864d926588d51d0d708977dba625b08e8`
- lynx-stack base: `3442218110d892670e14bb6332e992d4a7840ac7`
- lynx-stack head: `178eeb0ca98198f574dc630793572f93d9b01155`

Both lynx-stack revisions were fully built before building the fixtures. The
configuration pins Rspeedy, the ReactLynx compiler/runtime, and Motion to the
selected `LYNX_STACK_ROOT` and compiles the lynx-ui components from source.

## Comparisons

Only two comparisons are made for each component:

1. Base plain page versus head plain page. The source is identical and does not
   import MotionValue or MainThreadObject. This measures the global cost of
   landing the pull request.
2. Head MotionValue workaround versus head MainThreadObject. Both use the same
   head runtime, real `motion-dom` MotionValue, component tree, element ref,
   main-thread tap, and native transform update. This isolates API adoption.

The workaround stores the MotionValue in `MainThreadRef`:

```tsx
const valueRef = useMainThreadRef<MotionValue<number>>(null)

function initializeValue() {
  'main thread'
  valueRef.current = motionValue(1)
}

useMemo(() => {
  if (__BACKGROUND__) {
    void runOnMainThread(initializeValue)()
  } else {
    runWorkletCtx(initializeValue, [])
  }
}, [])
```

The MainThreadObject variant replaces only that ownership and transport:

```tsx
const motionValueType = defineMainThreadObjectType<number, MotionValue<number>>({
  type: '@lynx-js/benchmark/MotionValue',
  create(initialValue) {
    'main thread'
    return motionValue(initialValue)
  },
})

const value = useMainThreadObject(motionValueType, 1)
```

Both probes use the same update:

```tsx
const next = value.get() === 1 ? 1.1 : 1
value.set(next)
probeRef.current?.setStyleProperties({ transform: `scale(${next})` })
```

## Bundle-size procedure and results

Each condition was independently built three times as a production Lynx
bundle. Raw filesystem sizes were identical. `gzip -9` varied by at most two
bytes; the table consistently uses run 3.

| Comparison | From raw | To raw | Raw delta | From gzip | To gzip | Gzip delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| TabGroup base plain -> head plain | 211,670 B | 216,310 B | +4,640 B | 85,935 B | 88,171 B | +2,236 B |
| TabGroup head workaround -> head object | 304,047 B | 309,550 B | +5,503 B | 127,112 B | 129,267 B | +2,155 B |
| Swiper base plain -> head plain | 183,546 B | 188,091 B | +4,545 B | 73,237 B | 75,494 B | +2,257 B |
| Swiper head workaround -> head object | 278,927 B | 284,433 B | +5,506 B | 117,310 B | 119,496 B | +2,186 B |

## Real-device startup procedure

- OSS LynxExplorer on one Android 10 `aries_10` device.
- Production bundles served through ADB-reversed localhost.
- Agent Lynx/Perfetto tracing starts before each batch of page opens.
- 24 balanced cycles per condition: 192 page starts across eight conditions.
- A balanced Latin square makes every condition occupy every launch position
  three times and balances first-order carry-over.
- Every start contains exactly one FMP, background render, serialization,
  hydration, and background-load span, plus two MTS render pairs.
- No trace was truncated and every `Tracing.tracingComplete` reported no data
  loss.
- Results are paired within each cycle and report median deltas with bootstrapped
  95% confidence intervals.

Each metric cell is `from median; paired delta [95% CI]`. “From” is the
absolute median cost of the left-hand condition. The delta is the median of 24
paired per-cycle differences. Positive deltas mean the right-hand condition
took longer. Because these are two different median calculations, adding the
from median and paired delta does not necessarily equal the right-hand
condition's absolute median.

| Comparison (from -> to) | FMP: from; delta | Initial MTS: from; delta | Hydration MTS: from; delta | Background load: from; delta | `ReactLynx::hydrate`: from; delta |
| --- | ---: | ---: | ---: | ---: | ---: |
| TabGroup base plain -> head plain | 21.497 ms; +0.337 ms [-1.170, 1.320] | 8.487 ms; +0.225 ms [-0.189, 0.918] | 2.402 ms; -0.116 ms [-0.403, 0.019] | 26.033 ms; -0.491 ms [-3.475, 0.365] | 1.104 ms; -0.006 ms [-0.049, 0.046] |
| TabGroup head workaround -> head object | 25.236 ms; -0.082 ms [-2.904, 2.362] | 10.101 ms; -0.065 ms [-2.214, 1.430] | 2.768 ms; -0.023 ms [-1.492, 0.800] | 25.411 ms; -0.214 ms [-0.570, 0.531] | 4.613 ms; -0.230 ms [-0.364, 0.070] |
| Swiper base plain -> head plain | 41.286 ms; +0.498 ms [-1.752, 3.486] | 22.227 ms; +0.124 ms [-0.703, 1.954] | 20.752 ms; **+0.981 ms [0.525, 1.356]** | 26.835 ms; +0.369 ms [-1.971, 5.755] | 16.835 ms; -0.282 ms [-1.305, 1.054] |
| Swiper head workaround -> head object | 45.201 ms; +1.743 ms [-4.097, 10.670] | 25.049 ms; +0.337 ms [-4.212, 10.876] | 22.235 ms; -0.005 ms [-0.457, 1.040] | 26.536 ms; **+1.591 ms [0.016, 5.924]** | 15.039 ms; -0.032 ms [-0.417, 1.037] |

## Interpretation and functional validation

- No comparison demonstrates an FMP regression.
- Landing the pull request shows no startup signal on plain TabGroup. Plain
  Swiper has a repeatable approximately 0.98 ms hydration-MTS increase.
- Adopting MainThreadObject shows no FMP, MTS-render, or
  `ReactLynx::hydrate` regression on either page.
- Swiper MainThreadObject has a 1.59 ms background-load interval signal. Since
  its direct background render and hydration spans do not increase, this is not
  evidence of extra `ReactLynx::hydrate` CPU work and should be tracked as a
  broader load/scheduling signal.
- The earlier TabGroup approximately 4.1 ms MainThreadObject hydration result
  did not reproduce after rebasing and reducing the matrix. The current paired
  median is -0.23 ms and its confidence interval crosses zero.

All eight pages rendered without console errors. Real ADB touches on both
MotionValue implementations and both component pages changed the green probe
from scale 1 to scale 1.1; the captured probe bounds changed from `433x124` to
`454x130-136` pixels.
