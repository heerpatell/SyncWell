import React from "react";
import { render } from "@testing-library/react";
import LocationListing from "./LocationListing";
import { AiOutlineDelete } from "react-icons/ai";
import "@testing-library/jest-dom";
import { describe, test, expect } from "@jest/globals";
import { BrowserRouter as Router } from "react-router-dom";

describe("LocationListing Component", () => {
	const mockLocation = "Test Location";
	const mockIcon = AiOutlineDelete;

	test("renders location and icon properly", () => {
		const { getByText } = render(
			<Router>
				<LocationListing
					icon={mockIcon}
					loc={mockLocation}
					onDelete={() => {}}
				/>
			</Router>,
		);

		expect(getByText(mockLocation)).toBeInTheDocument();
		expect(document.querySelector("svg")).toBeInTheDocument();
	});
});
