module.exports = {
    roots: [
        "<rootDir>/src"
    ],
    transform: {
        "^.+\\.ts$": "ts-jest"
    },
    testMatch: [
        "**/__tests__/*.+(ts|js)"
    ],
    moduleFileExtensions: [
        "js",
        "ts"
    ]
};
