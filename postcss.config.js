/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  plugins: {
    'postcss-preset-env': {
      browsers: 'last 2 versions, not dead',
      preserve: false,
      features: {
        'custom-media-queries': true,
        'custom-properties': {disableDeprecationNotice: true},
        'nesting-rules': true,
        'focus-visible-pseudo-class': {}
      },
      importFrom: ['./src/styles/variables.css']
    }
  }
}
