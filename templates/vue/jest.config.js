module.exports = {
  moduleFileExtensions: ["js", "json", "vue"],
  transform: {
    "^.+\\.vue$": "@vue/vue2-jest",
    "^.+\\.js$": "babel-jest",
  },
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less|scss)$": "<rootDir>/__mocks__/styleMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/*.spec.[tj]s?(x)"],
  transformIgnorePatterns: ["/node_modules/(?!(vue-youtube-embed|d3|d3-.+|internmap|delaunator|robust-predicates)/).*/"],
  setupFilesAfterEnv: ["./config/jest-setup.js"],
  collectCoverage: true,
  coverageDirectory: "coverage-jest",
}
