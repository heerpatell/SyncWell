import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Weeklyhours from "./Weeklyhours";
import { BrowserRouter as Router } from "react-router-dom";
import { describe, test, expect } from "@jest/globals";

describe("Weeklyhours component", () => {
	test("renders without crashing", () => {
		render(
			<Router>
				<Weeklyhours />
			</Router>,
		);
	});

	test('renders the "Weekly Hours" text', () => {
		const { getByText } = render(
			<Router>
				<Weeklyhours />
			</Router>,
		);
		expect(getByText("Weekly Hours")).toBeInTheDocument();
	});

	test('adds a block when "Add" button is clicked', () => {
		const { queryByText } = render(
			<Router>
				<Weeklyhours />
			</Router>,
		);
		const fromInput = screen.findAllByText("From");
		const toInput = screen.findAllByText("To");
		const addButton = screen.findAllByText("Add");

		userEvent.type(fromInput, "09:00");
		userEvent.type(toInput, "17:00");
		userEvent.click(addButton);

		expect(queryByText("09:00")).toBeNull();
		expect(queryByText("17:00")).toBeNull();
	});
});
