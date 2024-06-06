module.exports = {
	extends: [],
	rules: {
		"header-min-length": [2, "always", 12],
		"header-case-start-with-square-brackets": [2, "always"],
	},
	plugins: [
		{
			rules: {
				"header-case-start-with-square-brackets": ({ raw }) => {
					return [/^(\[+)([A-Z]+)([a-z]+)(\]+)/.test(raw), "Commit message must start with a action under sqaure brackets, i.e. [Fix], [Working], etc."];
				},
			},
		},
	],
};