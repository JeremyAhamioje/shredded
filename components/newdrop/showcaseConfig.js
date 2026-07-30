// ─── Master switch for the WebGL "showcase" treatment ───────────────────────
//
//   true  = full showcase: WebGL cards (shaders, tinted lighting, contact
//           shadow, hover flip / cycle), card outlines, ambient section glow.
//   false = plain e-commerce look: static product images, no shaders, no
//           lighting, no hover motion, no outlines, no glow.
//
//   Everything is gated on this ONE constant, so flipping it back to `true`
//   fully restores the original showcase in a single edit.
//
export const SHOWCASE_FX = false;
