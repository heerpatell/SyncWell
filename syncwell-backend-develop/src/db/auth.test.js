const {
	storeOtp,
	verifyOtp,
	saveToken,
	fetchOAuthToken,
	removeOAuthToken,
} = require("./auth");
const { validateDbResp } = require("../util");

const mockDb = {
	execute: jest.fn(),
	beginTransaction: jest.fn(),
	commit: jest.fn(),
	abortTransaction: jest.fn(),
};

jest.mock("../util", () => ({
	generateUUID: jest.fn(),
	validateDbResp: jest.fn(),
}));

const mockOTPDetails = {
	userID: "qwerty123",
	otpNum: "1234",
	tokenDetails: {
		authCode: "dummyAuthCode",
		accessToken: "dummyAccessToken",
		refreshToken: "dummyRefreshToken",
		expiryDate: "2022-01-01",
	},
	tokens: {
		access_token: "dummyAccessToken",
		refresh_token: "dummyRefreshToken",
		expiry_date: "2022-01-01",
	},
	authCode: "dummyAuthCode",
};

beforeEach(() => {
	validateDbResp.mockReturnValue([{}]);
	mockDb.execute.mockResolvedValue([{}]);
});
afterEach(() => {
	jest.clearAllMocks();
});

describe("storeOtp", () => {
	test("should store the OTP in the database", async () => {
		mockDb.execute.mockResolvedValueOnce([
			{
				affectedRows: 1,
			},
		]);
		const result = await storeOtp(mockDb, {
			userID: mockOTPDetails.userID,
			otpNum: mockOTPDetails.otpNum,
		});
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	test("should throw an error if invalid data is provided", async () => {
		const mockdb = {
			execute: jest.fn(),
		};
		const userID = null;

		await expect(
			storeOtp(mockdb, { userID, otpNum: mockOTPDetails }),
		).rejects.toThrow("Invalid data for storing OTP.");
		expect(mockdb.execute).not.toHaveBeenCalled();
	});

	test("should throw an error if unable to store the OTP", async () => {
		// const mockDb = {
		//   execute: jest.fn().mockReturnValue({ affectedRows: 0 }),
		// };

		mockDb.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
		validateDbResp.mockReturnValue(false);

		await expect(
			storeOtp(mockDb, {
				userID: mockOTPDetails.userID,
				otpNum: mockOTPDetails.otpNum,
			}),
		).rejects.toThrow("Unable to store OTP.");
		expect(mockDb.execute).toHaveBeenCalled();
	});
});

describe("verifyOtp", () => {
	test("should return true if the OTP is valid", async () => {
		mockDb.execute.mockResolvedValueOnce([
			{ userID: mockOTPDetails.userID },
		]);

		const result = await verifyOtp(mockDb, {
			userID: mockOTPDetails.userID,
			otpNum: mockOTPDetails.otpNum,
		});

		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	test("should throw an error if invalid data is provided", async () => {
		const mkDb = {
			execute: jest.fn(),
		};

		await expect(
			verifyOtp(mkDb, { userID: null, otpNum: mockOTPDetails.otpNum }),
		).rejects.toThrow("Invalid data for verifying OTP.");
		expect(mkDb.execute).not.toHaveBeenCalled();
	});

	test("should throw an error if the OTP is invalid", async () => {
		mockDb.execute.mockResolvedValueOnce([]);
		validateDbResp.mockReturnValue(false);

		await expect(
			verifyOtp(mockDb, {
				userID: mockOTPDetails.userID,
				otpNum: mockOTPDetails.otpNum,
			}),
		).rejects.toThrow("Invalid OTP");
		expect(mockDb.execute).toHaveBeenCalled();
	});
});

describe("saveToken", () => {
	test("should save tokens successfully", async () => {
		mockDb.execute.mockResolvedValue([{}]);

		const result = await saveToken(
			mockDb,
			mockOTPDetails.userID,
			{ tokens: mockOTPDetails.tokens },
			mockOTPDetails.authCode,
		);

		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	test("should throw an error if data is invalid", async () => {
		const dummytokens = {
			access_token: null,
			refresh_token: "dummyRefreshToken",
			expiry_date: "2022-01-01",
		};

		await expect(
			saveToken(
				mockDb,
				mockOTPDetails.userID,
				{ tokens: dummytokens },
				mockOTPDetails.authCode,
			),
		).rejects.toThrow("Invalid data for saving tokens.");
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("should throw an error if unable to save tokens", async () => {
		mockDb.execute.mockResolvedValueOnce([{ affectedRows: 0 }]);
		validateDbResp.mockReturnValue(false);
		await expect(
			saveToken(
				mockDb,
				mockOTPDetails.userID,
				{ tokens: mockOTPDetails.tokens },
				mockOTPDetails.authCode,
			),
		).rejects.toThrow("Unable to save tokens.");
		expect(mockDb.execute).toHaveBeenCalled();
	});
});

describe("fetchOAuthToken", () => {
	test("should fetch the OAuth token details for a valid user ID", async () => {
		mockDb.execute.mockResolvedValue([
			[
				{
					authCode: "dummyAuthCode",
					accessToken: "dummyAccessToken",
					refreshToken: "dummyRefreshToken",
					expiryDate: "2022-01-01",
				},
			],
		]);

		const result = await fetchOAuthToken(mockDb, mockOTPDetails.userID);
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toEqual({
			tokenDetails: {
				authCode: "dummyAuthCode",
				accessToken: "dummyAccessToken",
				refreshToken: "dummyRefreshToken",
				expiryDate: "2022-01-01",
			},
		});
	});

	test("should throw an error for an invalid user ID", async () => {
		const userID = null;

		await expect(fetchOAuthToken(mockDb, userID)).rejects.toThrow(
			"Invalid data for fetching tokens.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("should return null for a user ID with no token details", async () => {
		validateDbResp.mockReturnValue(false);
		const result = await fetchOAuthToken(mockDb, mockOTPDetails.userID);
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toEqual({
			tokenDetails: null,
		});
	});
});

describe("removeOAuthToken", () => {
	test("should remove the OAuth token for a valid user ID", async () => {
		mockDb.execute.mockResolvedValue([
			{
				affectedRows: 1,
			},
		]);

		const result = await removeOAuthToken(mockDb, mockOTPDetails.userID);

		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	test("should throw an error for an invalid user ID", async () => {
		const userID = null;

		await expect(removeOAuthToken(mockDb, userID)).rejects.toThrow(
			"Invalid data for removing tokens.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("should throw an error if unable to remove the OAuth token", async () => {
		mockDb.execute.mockResolvedValue([]);
		validateDbResp.mockReturnValue(false);

		await expect(
			removeOAuthToken(mockDb, mockOTPDetails.userID),
		).rejects.toThrow("Unable to remove tokens.");
		expect(mockDb.execute).toHaveBeenCalled();
	});
});
