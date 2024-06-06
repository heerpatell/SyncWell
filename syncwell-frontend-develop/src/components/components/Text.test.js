import React from "react";
import { render } from "@testing-library/react";
import Text from "./Text";
import { describe, test, expect } from "@jest/globals";

describe("Text Component", () => {
	test("renders text with provided props", () => {
		const text = "Example Text";
		const color = "red";
		const txtsize = "body1";
		const fontWeight = "bold";

		const { getByText } = render(
			<Text
				txt={text}
				color={color}
				txtsize={txtsize}
				fontWeight={fontWeight}
			/>,
		);

		const renderedText = getByText(text);

		expect(renderedText).toBeInTheDocument();
		expect(renderedText).toHaveStyle(`color: ${color}`);
		expect(renderedText).toHaveStyle(`font-weight: ${fontWeight}`);
	});
});
