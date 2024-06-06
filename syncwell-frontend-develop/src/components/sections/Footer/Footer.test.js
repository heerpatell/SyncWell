import React from "react";
import { render } from "@testing-library/react";
import Footer from "./Footer";
import { describe, test, expect } from "@jest/globals";

describe("Footer Component", () => {
	test("renders About, Services, and Contact links", () => {
		const { getByText } = render(<Footer />);
		expect(getByText("About")).toBeInTheDocument();
		expect(getByText("Services")).toBeInTheDocument();
		expect(getByText("Contact")).toBeInTheDocument();
	});

	test("renders SyncWell - 2024 text", () => {
		const { getByText } = render(<Footer />);
		expect(getByText("SyncWell - 2024")).toBeInTheDocument();
	});

	test("renders Privacy Policy and Terms of Use links", () => {
		const { getByText } = render(<Footer />);
		expect(getByText("Privacy Policy")).toBeInTheDocument();
		expect(getByText("Terms of use")).toBeInTheDocument();
	});
});
