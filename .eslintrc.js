module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "amd": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    // "globals": {
    //     "THREE": false,
    //     "CANNON": false
    // },
    "rules": {
        "no-undef": 2,
        "no-unused-vars": 1,
        "no-redeclare": 1,
        "no-extra-semi": 1,
        "no-var": 1,
        "no-console": 'off',
        "indent": [
            "warn",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};