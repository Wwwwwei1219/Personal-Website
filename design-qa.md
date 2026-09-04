# Design QA

## Comparison target

- Source visual truth: `/private/tmp/figma-content-source.png`, exported from Figma node `2015:3` in file `FdZ1ot2Lzl4xreDxwUEOa2`.
- Work-experience source: Figma node `2018:141` in the same file; three exact dashed-line SVG assets are stored under `public/assets/work-line-*.svg`.
- Implementation evidence: `/private/tmp/figma-content-local-default.png` and `/private/tmp/figma-content-local-hover.png`, captured from `http://localhost:4173/`.
- Theme implementation evidence: `/private/tmp/mesh-realistic-pull-dark.png` and `/private/tmp/mesh-realistic-pull-light.png`.
- Theme side-by-side comparison: `/private/tmp/mesh-realistic-pull-comparison.png`.
- Full-view comparison: `/private/tmp/figma-content-comparison-full.png`.
- Focused content comparison: `/private/tmp/figma-content-comparison-focused.png`.
- Intended scope: add the Figma middle content area to the existing interactive dot-field page. The pre-existing dot-field background is intentionally preserved.

## Normalization

- Figma source: 1920 × 1080 pixels.
- Browser implementation: 1920 × 1080 pixels, CSS viewport 1920 × 1080, device scale factor 1.
- Theme and state: dark theme; default avatar state and avatar hover state were captured separately.
- Responsive safety check: 390 × 844 CSS viewport, panel width 358px, no horizontal overflow.
- Theme comparison: dark and light captures are both 818 × 994 pixels at an 818 × 994 CSS viewport; browser DPR is 2 and the screenshots are CSS-pixel normalized.

## Full-view comparison evidence

- The 640px content column is centered at x=640 in the 1920px frame and starts at y=0, matching the Figma frame.
- Header, 64px avatar, name, and introduction block align to the specified x/y positions and preserve the design's sparse composition.
- The implementation retains the existing dot-field behind the content, as requested; this is an intentional difference from the plain Figma background.
- The theme comparison keeps all geometry, copy, imagery, and interaction placement identical between dark and light states; only the requested visual tokens and toggle state change.

## Focused region comparison evidence

- Header and three placeholders retain the same 20px vertical padding, 12px sizing, gray color, and 16px item gap. The date is intentionally replaced by a live `Asia/Shanghai` clock after user review.
- Avatar bounds match 64 × 64 at x=656, y=87. The default state uses the exact Figma-exported `头像_默认` raster at 4× resolution.
- Name is positioned at x=656, y=167 with 16px semibold white type.
- Introduction starts at x=656, y=204, measures 608px wide, and uses the user-requested 14px type with 24px line height and 4px paragraph spacing.
- Hover swaps to the exact 4× Figma-exported `头像_2` raster; browser-computed opacity changes from default `1` / hover `0` to default `0` / hover `1`.
- The theme control uses a 28 × 140px transparent pull-cord image inside a 44 × 160px clipped button at the far-right edge. At rest, the image starts at -34px after the user-requested 6px upward adjustment; pulling reveals its built-in extended cord until it reaches -6px. A downward pointer pull follows the cursor for up to 28px and toggles the theme after crossing a 12px threshold; click and keyboard activation remain available.
- Native image dragging is disabled (`draggable=false`, `pointer-events:none`, `user-select:none`, and `-webkit-user-drag:none`), so pulling never exposes a PNG drag ghost.

## Required fidelity surfaces

- Fonts and typography: weights, line heights, wrapping, and hierarchy follow the Figma values, with body copy intentionally increased to 14px after user review. Browser font antialiasing may differ slightly from Figma's renderer; the declared stacks prioritize DIN and Microsoft YaHei UI with system fallbacks.
- Spacing and layout rhythm: all measured desktop coordinates, widths, avatar radius, header gap, and introduction spacing match the design context.
- Colors and visual tokens: dark mode retains page background `#07080a`, metadata `#616161`, body copy `#bfbfbf`, and name `#ffffff`. Light mode uses background `#f3f4f6`, metadata `#6b7280`, body copy `#414852`, and name `#111827`, with darker canvas dots for equivalent visual density.
- Image quality and asset fidelity: both avatar states are exact 256 × 256 PNG exports from their Figma nodes and render at 64 × 64. The pull cord uses a dedicated transparent 112 × 560 PNG at `public/assets/theme-pull-cord-extended.png`; the original 112 × 448 pixels are preserved and its top cord texture is continued into the added 112px canvas area. No CSS-drawn extension is used.
- Copy and content: placeholders, name, and all five introduction paragraphs match the Figma node text; the date is a live Beijing-time value.

## Findings

- No actionable P0, P1, or P2 differences remain within the requested content-area scope.
- P3: very small text antialiasing differs slightly between the Figma export and the browser renderer; geometry and typographic metrics remain aligned.

## Comparison history

1. Initial implementation comparison: no P0/P1/P2 issues found. The content column, copy, asset states, and measured layout matched the Figma source.
2. Hover verification: moving the pointer over the avatar displayed `头像_2` and fully hid `头像_默认`.
3. Responsive verification: the content column contracted without horizontal overflow at 390 × 844.
4. User-review iteration: avatar exports increased to 4×, the clock changed to live Beijing time, and the introduction font increased to 14px.
5. User-review iteration: introduction line height increased from 20px to 22px, then to 24px.
6. Theme iteration: added a right-aligned text toggle, verified dark → light → dark behavior, and compared both states side by side. No P0/P1/P2 visual issue was found.
7. Pull-cord iteration: replaced the text toggle with a generated transparent pull-cord asset and a 300ms tug animation. The first capture exposed a P2 focus outline that read as an unintended curved loop; the rectangular outline was removed, focus was moved to an asset-level glow, and the revised dark/light comparison shows no remaining P0/P1/P2 issue.
8. Work-experience iteration: added the three Figma records beneath the introduction with exact copy, marker colors, 14px typography, 12px row spacing, exported dashed-line assets, and a responsive two-line narrow layout.
9. Avatar-motion iteration: added an 8% hover/focus scale with a 220ms eased transition and lengthened the image crossfade to 180ms.
10. Theme-transition iteration: added a 620ms origin-aware radial reveal from the pull-cord position using the View Transition API, with an expanding backdrop-inversion fallback and an instant reduced-motion path.

## Verification

- Primary interactions tested: avatar hover swap, keyboard focus swap, work-item hover dimming, pointer movement over the existing dot-field, viewport resize, responsive wrapping, click animation, physical downward drag, and dark → light → dark theme switching.
- Browser console warnings/errors: none.
- Production build: passed.
- Sites packaging tests: 4 passed, 0 failed.

## Implementation checklist

- [x] Pull-cord image cannot start a native browser drag.
- [x] A 22px browser drag crossed the 12px threshold and toggled dark → light; releasing reset the pull offset to 0px.
- [x] The 140px rendered cord remains within its clipped 160px control and causes no horizontal or vertical overflow.
- [x] Pulling reveals the extended area from the same PNG, so no separate CSS line or seam appears at maximum pull.
- [x] The 520ms side-bend rebound and its related state have been removed.
- [x] Add the three work-experience rows from Figma node `2018:141` beneath the introduction.
- [x] Hovering the first record keeps it at opacity 1 and reduces the other two to opacity 0.24.
- [x] Verify the 375 × 994 narrow layout: section at y=672, no horizontal or vertical overflow.
- [x] Avatar hover and keyboard focus scale the circular control to 1.08 without changing document layout.
- [x] Theme changes reveal radially from the pull cord while preserving direct fallback switching.
- [x] Browser verification captured the light theme expanding from the top-right pull cord with the old dark layer receding at the lower edge.
- [x] Reverse light-to-dark transition completed in 620ms, restored `aria-pressed=false`, removed all temporary transition state, and emitted no warnings or errors.

- [x] Add centered 640px content column.
- [x] Reproduce Figma typography, spacing, color, and copy.
- [x] Store exact Figma avatar assets locally.
- [x] Swap to `头像_2` on hover and keyboard focus.
- [x] Render a live Beijing-time clock.
- [x] Apply the user-requested 14px introduction font.
- [x] Apply the user-requested 24px introduction line height.
- [x] Replace the text toggle with a right-aligned pull-cord control using a real transparent asset.
- [x] Add tug feedback and asset-level keyboard focus treatment.
- [x] Verify matched dark and light layouts, color tokens, dot-field visibility, and reversible switching.
- [x] Verify desktop, narrow viewport, build, tests, and browser console.

final result: passed
