module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        'airbnb-base',
    ],
    rules: {
        indent: [
            'error',
            4,
        ],
        'prefer-destructuring': ['error', {
            array: false,
            object: true,
        }],
        'linebreak-style': ['off', 'windows'],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // 'no-debugger': 'off',
        'no-underscore-dangle': ['error', {
            allowAfterThis: true,
        }],
        'no-return-assign': ['error', 'except-parens'],
        'no-bitwise': ['error', {
            allow: ['~'],
        }],
    },
    parserOptions: {
        parser: 'babel-eslint',
    },
};
