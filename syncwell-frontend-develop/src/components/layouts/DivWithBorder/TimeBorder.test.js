import React from "react";
import { render } from "@testing-library/react";
import TimeBorder from "./TimeBorder";
import { describe, test, expect } from "@jest/globals";
import { BrowserRouter as Router } from "react-router-dom";

describe("TimeBorder", () => {
	test("renders the time correctly", () => {
		const time = "10:00 AM";
		const { getByText } = render(
			<Router>
				<TimeBorder time={time} />
			</Router>,
		);
		expect(getByText(time)).toBeInTheDocument();
	});

	test("applies selected styles when selected prop is true", () => {
		const { getByText } = render(
			<Router>
				<TimeBorder time="10:00 AM" selected />
			</Router>,
		);
		const timeBorderElement = getByText("10:00 AM").parentElement;
		expect(timeBorderElement).toHaveStyle(`
      background-color: #1F8B8B;
      color: #FFFFFF;
    `);
	});

	test("applies default styles when selected prop is false", () => {
		const { getByText } = render(
			<Router>
				<TimeBorder time="10:00 AM" />
			</Router>,
		);
		const timeBorderElement = getByText("10:00 AM").parentElement;
		expect(timeBorderElement).toHaveStyle(`
      background-color: transparent;
      color: #1F8B8B;
    `);
	});
});
