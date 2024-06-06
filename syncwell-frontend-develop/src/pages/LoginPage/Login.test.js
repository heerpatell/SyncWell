import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import LoginPage from "./LoginPage";
import { describe, test, expect } from "@jest/globals";
import { BrowserRouter as Router } from "react-router-dom";

describe("LandingPage", () => {
	test("renders email input and login button by default", () => {
		const { getByPlaceholderText, getByText } = render(
			<Router>
				<LoginPage />
			</Router>,
		);
		expect(getByPlaceholderText("Email address")).toBeInTheDocument();
		expect(getByText("Login")).toBeInTheDocument();
	});

	test("displays OTP input and verify button after successful login", async () => {
		const { getByPlaceholderText, getByText } = render(
			<Router>
				<LoginPage />
			</Router>,
		);
		const loginButton = getByText("Login");
		fireEvent.click(loginButton);
		await waitFor(() =>
			expect(getByPlaceholderText("Entern an OTP")).toBeInTheDocument(),
		);
		expect(getByText("Verify")).toBeInTheDocument();
	});

	test("displays correct message about sent OTP email after successful login", async () => {
		const email = "test@example.com";
		const { getByText, getByPlaceholderText } = render(
			<Router>
				<LoginPage />
			</Router>,
		);
		const loginButton = getByText("Login");
		const emailInput = getByPlaceholderText("Email address");
		fireEvent.change(emailInput, { target: { value: email } });
		fireEvent.click(loginButton);
		await waitFor(() =>
			expect(getByText(`An otp is sent to ${email}`)).toBeInTheDocument(),
		);
	});

	test("navigates to account setup page after entering OTP and clicking verify", async () => {
		const { getByText, getByPlaceholderText } = render(
			<Router>
				<LoginPage />
			</Router>,
		);
		const loginButton = getByText("Login");
		fireEvent.click(loginButton);
		const otpInput = getByPlaceholderText("Entern an OTP");
		const verifyButton = getByText("Verify");
		fireEvent.change(otpInput, { target: { value: "123456" } });
		fireEvent.click(verifyButton);
	});
});
