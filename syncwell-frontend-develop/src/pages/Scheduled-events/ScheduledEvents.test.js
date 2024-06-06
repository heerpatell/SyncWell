import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ScheduledEvents from "./ScheduledEvents";
import { describe, test, expect } from "@jest/globals";
import { BrowserRouter as Router } from "react-router-dom";

describe("ScheduledEvents Component", () => {
	test("renders scheduled meets header correctly", () => {
		render(
			<Router>
				<ScheduledEvents />
			</Router>,
		);
		const headerElement = screen.getByText("Scheduled Meets");
		expect(headerElement).toBeInTheDocument();
	});

	test("renders default tab as organizer", () => {
		render(
			<Router>
				<ScheduledEvents />
			</Router>,
		);
		const organizerTab = screen.getByText("As Organizer");
		expect(organizerTab).toHaveClass("selected");
	});

	test("switches tab when clicked", () => {
		render(
			<Router>
				<ScheduledEvents />
			</Router>,
		);
		const attendeeTab = screen.getByText("As Attendee");
		fireEvent.click(attendeeTab);
		expect(attendeeTab).toHaveClass("selected");
	});

	test("switches tab to attendee when clicked", () => {
		render(
			<Router>
				<ScheduledEvents />
			</Router>,
		);
		const attendeeTab = screen.getByText("As Attendee");
		fireEvent.click(attendeeTab);
		const selectedTab = screen.getByText("As Attendee");
		expect(selectedTab).toHaveClass("selected");
	});
});
