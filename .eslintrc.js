module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
    ecmaFeatures: {
      impliedStrict: true,
    },
    ecmaVersion: 2020,
  },
  env: {
    es2020: true,
    node: true,
    jest: true,
    browser: true,
  },
  plugins: ['import', 'lodash', 'vue'],
  extends: [
    'plugin:vue/base',
    'plugin:vue/recommended',
    'plugin:vue/strongly-recommended',
    'plugin:prettier/recommended',
    '@vue/prettier',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  settings: {
    'import/resolver': {
      'babel-module': {
        alias: {
          '@': './src',
        },
      },
    },
  },
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'graphql/template-strings': [
    //   'error',
    //   {
    //     env: 'literal',
    //     projectName: 'app',
    //     schemaJsonFilepath: 'node_modules/.temp/graphql/schema.json',
    //   },
    // ],
    'vue/arrow-spacing': 'error',
    'vue/array-bracket-spacing': 'error',
    'vue/arrow-spacing': 'error',
    'vue/block-spacing': 'error',
    'vue/brace-style': 'error',
    'vue/camelcase': 'error',
    'vue/comma-dangle': ['error', 'always-multiline'],
    'vue/component-name-in-template-casing': 'off',
    // [
    //   'off',
    //   'PascalCase',
    //   {
    //     registeredComponentsOnly: true,
    //     ignores: ['/^editor-/'],
    //   },
    // ],
    'vue/dot-location': ['error', 'property'],
    'vue/eqeqeq': 'error',
    'vue/key-spacing': 'error',
    'vue/keyword-spacing': 'error',
    'vue/max-attributes-per-line': 'off',
    'vue/no-boolean-default': ['error', 'default-false'],
    'vue/no-deprecated-scope-attribute': 'error',
    'vue/no-empty-pattern': 'error',
    'vue/object-curly-spacing': ['error', 'always'],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'any',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/space-infix-ops': 'error',
    'vue/space-unary-ops': 'error',
    'vue/v-on-function-call': 'error',
    'vue/v-slot-style': [
      'error',
      {
        atComponent: 'v-slot',
        default: 'v-slot',
        named: 'longform',
      },
    ],
    'vue/valid-v-slot': 'error',

    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/default': 'error',
    'import/export': 'error',
    'import/no-dynamic-require': 'off',
    'no-duplicate-imports': 'error',
    'import/no-named-as-default': 'warn',
    'import/no-named-as-default-member': 'warn',
    'sort-imports': 'off',

    'arrow-parens': 'error',
    'arrow-spacing': 'error',
    'brace-style': 'error',
    'block-spacing': 'error',
    curly: ['error', 'all'],
    'default-case': 'error',
    eqeqeq: 'error',
    'id-length': [
      // enforce minimum and maximum identifier lengths
      'error',
      {
        exceptions: ['h', 'i', 'j', 'k', 'el', '$', '_', 't', 'x', 'y'],
      },
    ],
    indent: [
      // enforce consistent indentation
      'off',
      2,
      {
        MemberExpression: 1,
        FunctionExpression: {
          parameters: 'off',
        },
        ObjectExpression: 'off',
        ArrayExpression: 'off',
        CallExpression: {
          arguments: 'off',
        },
        SwitchCase: 1,
      },
    ],
    'max-len': [
      'warn',
      {
        code: 180,
        comments: 180,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ], // enforce a maximum line length
    'max-params': ['error', 6],
    'new-parens': 'error',
    'no-confusing-arrow': 'warn',
    'no-const-assign': 'error',
    'no-dupe-class-members': 'error',
    'no-empty-function': 'off',
    'no-multi-str': 'error',
    'no-trailing-spaces': 'error',
    'no-underscore-dangle': 'warn',
    'no-unexpected-multiline': 'error',
    'no-unneeded-ternary': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'one-var-declaration-per-line': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    quotes: ['error', 'single', { allowTemplateLiterals: true }],
    'use-isnan': 'error',
    yoda: 'error', // disallow Yoda conditions
    'prettier/prettier': [
      'error',
      {
        'endOfLine': 'auto',
      }
    ]
  },
};
