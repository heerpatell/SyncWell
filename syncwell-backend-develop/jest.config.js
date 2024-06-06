const dotenv = require("dotenv");

dotenv.config({
	path: ".env",
});

module.exports = {
	testSequencer: "./src/tests/testSequencer.js",
	// "testMatch": ["**/src/db/*.test.js", "**/src/integration/*.test.js"],
};
