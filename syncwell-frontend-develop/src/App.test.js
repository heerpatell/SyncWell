import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { describe, test } from "@jest/globals";

describe("App Component", () => {
	test("renders learn react link", () => {
		render(
			<Router>
				<App />
			</Router>,
		);
	});
});
