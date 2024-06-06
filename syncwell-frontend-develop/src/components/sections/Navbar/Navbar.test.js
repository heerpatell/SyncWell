import React from "react";
import { render } from "@testing-library/react";
import Navbar from "./Navbar";
import { describe, test, expect } from "@jest/globals";

describe("Navbar Component", () => {
	test("renders SyncWell logo with text", () => {
		const { getByText } = render(<Navbar />);
		expect(getByText("SyncWell")).toBeInTheDocument();
	});

	test("renders Login and Get Started links", () => {
		const { getByText } = render(<Navbar />);
		expect(getByText("Login")).toBeInTheDocument();
		expect(getByText("Get Started")).toBeInTheDocument();
	});
});
