// Copyright 2026 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { describe, expect, it } from 'vitest'

import { getDefaultUiVariantDescription } from './tpl'

describe('getDefaultUiVariantDescription', () => {
  it('describes boolean render props as active when true', () => {
    expect(getDefaultUiVariantDescription('disabled', 'boolean')).toBe(
      'Applied when `status.disabled` is true.',
    )
  })

  it('describes nullable render props as active when non-null', () => {
    expect(getDefaultUiVariantDescription('value', 'string | null')).toBe(
      'Applied when `status.value` is not `null`.',
    )
  })
})
