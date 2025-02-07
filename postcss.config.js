// [ARCH DECISION] [Tailwind PostCSS Configuration]
//
// @security {No security considerations here.}
// @perf {Minimal overhead; required only during build.}
// @a11y {No accessibility impact.}
// @handoff {QA: Ensure that Tailwind styles compile correctly.}

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}