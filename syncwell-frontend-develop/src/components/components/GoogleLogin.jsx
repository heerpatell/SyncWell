import React from "react";
// import { sendRequest } from '../../util';

export function GoogleCallback() {
	React.useEffect(() => {
		console.log(28, window.location);
		// Parse the query parameters from the URL
		const searchParams = new URLSearchParams(window.location.search);
		const code = searchParams.get("code");
		const state = searchParams.get("state");

		// Use the obtained code and state as needed
		console.log("Authorization Code:", code);
		console.log("State:", state);

		if (window.opener) {
			window.opener.postMessage(
				{
					type: "child-callback",
					payload: {
						code,
						state,
					},
				},
				window.location.origin,
			);
			window.close();
		}
	}, []);

	return <h1>Google Callback</h1>;
}
