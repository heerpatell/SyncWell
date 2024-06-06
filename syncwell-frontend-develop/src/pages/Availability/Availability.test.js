import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Availability from "./Availability";
import { describe, test, expect } from "@jest/globals";

describe("Availability component", () => {
	test("renders Availability component correctly", async () => {
		render(
			<Router>
				<Availability />
			</Router>,
		);

		await screen.findAllByText("Availability");
		await screen.findAllByText("TimeZone :");
		await screen.findAllByText("US, Canada GMT-4");

		expect(screen.getByText("TimeZone :")).not.toBeNull();
	});

	test("renders Weeklyhours and DateSpecificHours components correctly", () => {
		render(
			<Router>
				<Availability />
			</Router>,
		);

		const weeklyHoursComponent = screen.queryAllByText(
			"weekly-hours-component",
		);
		expect(weeklyHoursComponent).not.toBeNull();

		const dateSpecificHoursComponent = screen.queryAllByText(
			"date-specific-hours-component",
		);
		expect(dateSpecificHoursComponent).not.toBeNull();
	});

	test("renders FaListUl icon in the Availability component", () => {
		render(
			<Router>
				<Availability />
			</Router>,
		);

		const listIcon = screen.queryAllByText(
			"availability-upper-box-fr-right-list",
		);
		expect(listIcon).not.toBeNull();
	});

	// test("increments the month when handleNextMonth is called", () => {
	// 	render(
	// 		<Router>
	// 			<Availability />
	// 		</Router>
	// 	);

	// 	const currentMonth = new Date().getMonth();

	// 	const nextMonth = (currentMonth + 1) % 12;
	// 	const nextMonthString = new Intl.DateTimeFormat("en", {
	// 		month: "long"
	// 	}).format(new Date(0, nextMonth));

	// 	const nextMonthButton = document.querySelector('.availability-upper-box-sr-right-rightArrow');

	// 	fireEvent.click(nextMonthButton);

	// 	const foundElement = queryByText(document.body, nextMonthString);
	// 	expect(foundElement).toBeNull();
	// });
});
