module.exports = {
  // extends: [
  //   'stylelint-config-standard',
  //   'stylelint-config-css-modules',
  //   'stylelint-config-rational-order',
  //   'stylelint-config-prettier',
  //   'stylelint-no-unsupported-browser-features',
  //   'stylelint-config-standard-scss',
  // ],
  extends: [
    'stylelint-config-standard', // 配置 stylelint 拓展插件
    'stylelint-config-standard-scss', // 配置 stylelint scss 插件
    'stylelint-prettier/recommended',
    'stylelint-config-recommended-scss',
    // 'stylelint-config-prettier',
    'stylelint-config-prettier-scss', // 配置 stylelint 和 prettier 兼容
  ],
  // extends: ['stylelint-config-standard-scss', 'stylelint-prettier/recommended', 'stylelint-config-rational-order'], // 继承基本配置和Prettier插件的配置
  // plugins: ['stylelint-order'],
  ignoreFiles: ['public/*', 'build/*', 'backup/*'],
  defaultSeverity: 'warning',
  // overrides: [
  //   {
  //     files: ['**/*.{scss,css}'], // css 相关文件由 postcss-scss 处理
  //     customSyntax: 'postcss-scss',
  //   },
  // ],
  rules: {
    'no-descending-specificity': null,
    'function-url-quotes': 'always',
    'font-family-no-missing-generic-family-keyword': null, // iconfont
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    // webcomponent
    'selector-type-no-unknown': null,
    'no-empty-source': null,
    'selector-pseudo-class-no-unknown': [
      // 不允许未知的选择器
      true,
      {
        ignorePseudoClasses: ['global', 'v-deep', 'deep'], // 忽略属性，修改element默认样式的时候能使用到
      },
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['mixin', 'include', 'extend'],
      },
    ],
  },
  // ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
};
