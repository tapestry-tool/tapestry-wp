module.exports = {
  moduleFileExtensions: ["js", "json", "vue"],
  transform: {
    "^.+\\.vue$": "vue-jest",
    "^.+\\.js$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["/node_modules/(?!(vue-youtube-embed)/).*/"],
  setupFilesAfterEnv: ["./config/jest-setup.js"],
  collectCoverage: true,
  coverageDirectory: "coverage-jest",
}
