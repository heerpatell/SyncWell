const { defaults } = require("jest-config");

module.exports = {
	moduleDirectories: ["node_modules"],
	moduleFileExtensions: ["tsx", ...defaults.moduleFileExtensions],
	globals: {
		"ts-jest": {
			tsConfig: "<rootDir>/tsconfig.json",
		},
	},
	transform: {
		"^.+\\.(js|jsx)$": "babel-jest-amcharts",
	},
	transformIgnorePatterns: [
		"[/\\\\]node_modules[/\\\\](?!(@amcharts)\\/).+\\.(js|jsx|ts|tsx)$",
	],
};
