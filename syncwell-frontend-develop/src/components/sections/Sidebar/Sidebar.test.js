import React from "react";
import { render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";
import { describe, test, expect } from "@jest/globals";
import { BrowserRouter as Router } from "react-router-dom";
import userEvent from "@testing-library/user-event";

describe("Sidebar component", () => {
	test("renders SyncWell logo with text", () => {
		render(
			<Router>
				<Sidebar />
			</Router>,
		);
		const logoWithText = screen.getByText("SyncWell");
		expect(logoWithText).toBeInTheDocument();
	});

	test('renders "Schedule a Meet" button', () => {
		render(
			<Router>
				<Sidebar />
			</Router>,
		);
		const scheduleButton = screen.getByText("Schedule a Meet");
		expect(scheduleButton).toBeInTheDocument();
	});

	test('opens the Schedule Meet dialog on "Schedule a Meet" button click', () => {
		render(
			<Router>
				<Sidebar />
			</Router>,
		);
		const scheduleButton = screen.queryAllByText("schedule-meet-button");
		userEvent.click(scheduleButton);
		const dialogTitle = screen.getByText("Schedule a Meet");
		expect(dialogTitle).toBeInTheDocument();
	});

	test("renders user name in sidebar", () => {
		render(
			<Router>
				<Sidebar />
			</Router>,
		);
		const userName = screen.getByText("Bhuvan");
		expect(userName).toBeInTheDocument();
	});

	test("renders navigation links", () => {
		render(
			<Router>
				<Sidebar />
			</Router>,
		);
		const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
		expect(dashboardLink).toBeInTheDocument();

		const availabilityLink = screen.getByRole("link", {
			name: /availability/i,
		});
		expect(availabilityLink).toBeInTheDocument();

		const scheduledEventsLink = screen.getByRole("link", {
			name: /scheduled events/i,
		});
		expect(scheduledEventsLink).toBeInTheDocument();

		const analysisLink = screen.getByRole("link", { name: /analysis/i });
		expect(analysisLink).toBeInTheDocument();
	});

	test("renders user name in sidebar", () => {
		render(
			<Router>
				<Sidebar />
			</Router>,
		);
		const userName = screen.getByText("Bhuvan");
		expect(userName).toBeInTheDocument();
	});
});
