module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    es6: true,
    browser: true,
    node: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  rules: {
    'no-multiple-empty-lines': ['error', {max: 1}],
    'no-empty': ['error', {allowEmptyCatch: true}],
    curly: ['error', 'all'],
    'eol-last': ['error', 'always'],
    'no-prototype-builtins': 'off',
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: 'block-like',
        next: '*'
      },
      {
        blankLine: 'always',
        prev: '*',
        next: 'block-like'
      },
      {
        blankLine: 'always',
        prev: '*',
        next: 'return'
      },
      {
        blankLine: 'any',
        prev: ['const', 'let'],
        next: ['const', 'let']
      },
      {
        blankLine: 'always',
        prev: 'expression',
        next: ['const', 'let']
      },
      {
        blankLine: 'always',
        prev: ['const', 'let'],
        next: 'expression'
      }
    ]
  }
}
