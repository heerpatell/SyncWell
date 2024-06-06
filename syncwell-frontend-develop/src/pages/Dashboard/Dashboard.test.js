import React from "react";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { describe, test, expect } from "@jest/globals";
import { BrowserRouter as Router } from "react-router-dom";

describe("Dashboard Component", () => {
	test("renders without crashing", () => {
		render(
			<Router>
				<Dashboard />
			</Router>,
		);
	});

	test("renders the dashboard heading correctly", () => {
		render(
			<Router>
				<Dashboard />
			</Router>,
		);
		const dashboardHeading = screen.getAllByText("Dashboard");
		expect(dashboardHeading.length).toBeGreaterThan(0);
	});

	test("renders schedule items correctly", () => {
		render(
			<Router>
				<Dashboard />
			</Router>,
		);
		const todaySchedule = screen.getByText(/Today/i);
		const tomorrowSchedule = screen.getByText(/Tomorrow/i);
		const janSchedule = screen.getByText("Jan 31");

		expect(todaySchedule).toBeInTheDocument();
		expect(tomorrowSchedule).toBeInTheDocument();
		expect(janSchedule).toBeInTheDocument();
	});

	test("renders holidays correctly", () => {
		render(
			<Router>
				<Dashboard />
			</Router>,
		);
		const christmasHoliday = screen.getByText("Christmas");
		const boxingDayHoliday = screen.getByText("Boxing Day");
		const newYearHoliday = screen.getByText("New Year");

		expect(christmasHoliday).toBeInTheDocument();
		expect(boxingDayHoliday).toBeInTheDocument();
		expect(newYearHoliday).toBeInTheDocument();
	});
});
