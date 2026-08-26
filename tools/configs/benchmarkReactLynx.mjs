// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import path from 'node:path'
import { pathToFileURL } from 'node:url'

export async function benchmarkReactLynx(config, options = {}) {
  const stackRoot = process.env.LYNX_STACK_ROOT
  if (!stackRoot) {
    throw new Error(
      'LYNX_STACK_ROOT must point to the tested lynx-stack checkout',
    )
  }

  const pluginPath = path.join(
    stackRoot,
    'packages/rspeedy/plugin-react/lib/index.js',
  )
  const aliasPluginPath = path.join(
    stackRoot,
    'packages/rspeedy/plugin-react-alias/dist/index.js',
  )
  const { LAYERS, pluginReactLynx } = await import(
    pathToFileURL(pluginPath).href
  )
  const { pluginReactAlias } = await import(
    pathToFileURL(aliasPluginPath).href
  )

  const plugins = config.plugins?.slice(0, -1) ?? []
  if (options.profile) {
    const { pluginRepoFilePath } = await import(
      pathToFileURL(path.join(
        stackRoot,
        'benchmark/react/plugins/pluginRepoFilePath.mjs',
      )).href
    )
    const { pluginScriptLoad } = await import(
      pathToFileURL(path.join(
        stackRoot,
        'benchmark/react/plugins/pluginScriptLoad.mjs',
      )).href
    )
    plugins.unshift(pluginRepoFilePath(), pluginScriptLoad())
  }
  const reactPlugins = pluginReactLynx({
    enableCSSSelector: true,
    enableCSSInheritance: true,
    enableNewGesture: true,
  })
  reactPlugins[1] = pluginReactAlias({
    LAYERS,
    rootPath: path.join(stackRoot, 'packages/rspeedy/plugin-react'),
  })
  plugins.push(...reactPlugins)

  const aliases = {
    '@lynx-js/lynx-ui$': path.join(
      process.cwd(),
      'Benchmark/LynxUiEntry.ts',
    ),
    '@lynx-js/lynx-ui-button$': path.join(
      process.cwd(),
      '../../../packages/lynx-ui-button/src/index.tsx',
    ),
    '@lynx-js/lynx-ui-common$': path.join(
      process.cwd(),
      '../../../packages/lynx-ui-common/src/index.tsx',
    ),
    '@lynx-js/lynx-ui-scroll-view$': path.join(
      process.cwd(),
      '../../../packages/lynx-ui-scroll-view/src/index.tsx',
    ),
    '@lynx-js/lynx-ui-swiper$': path.join(
      process.cwd(),
      '../../../packages/lynx-ui-swiper/src/index.ts',
    ),
    '@lynx-js/lynx-ui-tab-group$': path.join(
      process.cwd(),
      '../../../packages/lynx-ui-tab-group/src/index.tsx',
    ),
    ...(options.motion
      ? {
        '@lynx-js/motion$': path.join(
          stackRoot,
          'packages/motion/dist/index.js',
        ),
        '@lynx-js/motion-benchmark-shim$': path.join(
          stackRoot,
          'packages/motion/dist/polyfill/shim.js',
        ),
        '@lynx-js/motion-benchmark-value$': path.join(
          stackRoot,
          'packages/motion/dist/polyfill/MotionValue.js',
        ),
      }
      : {}),
  }

  return {
    ...config,
    plugins,
    source: options.profile
      ? {
        ...config.source,
        define: {
          ...config.source?.define,
          __REPO_FILEPATH__: JSON.stringify('lynx-ui/real-page-benchmark'),
        },
        entry: Object.fromEntries(
          Object.entries(config.source?.entry ?? {}).map(([name, entry]) => [
            name,
            [
              path.join(stackRoot, 'benchmark/react/src/patchProfile.ts'),
              ...(Array.isArray(entry) ? entry : [entry]),
            ],
          ]),
        ),
      }
      : config.source,
    performance: options.profile
      ? { ...config.performance, profile: true }
      : config.performance,
    tools: {
      ...config.tools,
      rspack: {
        ...config.tools?.rspack,
        resolve: {
          ...config.tools?.rspack?.resolve,
          alias: aliases,
        },
      },
    },
  }
}
