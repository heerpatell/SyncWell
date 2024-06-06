const {
	createUserWithEmail,
	updateUserProfile,
	fetchUserProfile,
	fetchUserProfileByEmail,
	createUserWithGoogleInfo,
} = require("./user-profile");
const { generateUUID, validateDbResp } = require("../util");

const mockDb = {
	execute: jest.fn(),
};

jest.mock("../util", () => ({
	generateUUID: jest.fn(),
	validateDbResp: jest.fn(),
}));

const mockUser = {
	userID: "qwerty123",
	email: "test@syncwell.com",
	firstName: "B",
	lastName: "G",
	country: "Canada",
	timezone: "America/Toronto",
};

beforeEach(() => {
	validateDbResp.mockReturnValue([{}]);
	mockDb.execute.mockResolvedValue([{}]);
});
afterEach(() => {
	jest.clearAllMocks();
});

describe("createUserWithEmail", () => {
	test("Should create a user profile with provided email", async () => {
		generateUUID.mockReturnValue(mockUser.userID);
		const result = await createUserWithEmail(mockDb, {
			email: mockUser.email,
		});

		expect(generateUUID).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toEqual({
			userID: expect.any(String),
			email: mockUser.email,
		});
		expect(validateDbResp).toHaveBeenCalled();
	});

	test("Throw an error for creating a user profile without email", async () => {
		await expect(createUserWithEmail(mockDb, {})).rejects.toThrow(
			"Insufficient data for creating a user profile.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Throw an error for failing to create a user profile", async () => {
		validateDbResp.mockReturnValue(false);
		await expect(
			createUserWithEmail(mockDb, { email: mockUser.email }),
		).rejects.toThrow("Unable to create a user profile.");
	});
});

describe("updateUserProfile", () => {
	test("Should update a user profile with provided data", async () => {
		const result = await updateUserProfile(
			mockDb,
			mockUser.userID,
			mockUser,
		);

		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toEqual({
			userID: expect.any(String),
			firstName: expect.any(String),
			lastName: expect.any(String),
			country: expect.any(String),
			timezone: expect.any(String),
		});
		expect(validateDbResp).toHaveBeenCalled();
	});

	test("Throw an error for updating a user profile with insufficient data", async () => {
		await expect(
			updateUserProfile(mockDb, mockUser.userID, {}),
		).rejects.toThrow("Insufficient data for updating a user profile.");
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Throw an error for failing to update a user profile", async () => {
		validateDbResp.mockReturnValue(false);
		await expect(
			updateUserProfile(mockDb, mockUser.userID, mockUser),
		).rejects.toThrow("Unable to update a user profile.");
	});
});

describe("fetchUserProfile", () => {
	test("Should fetch a user profile from user ID", async () => {
		mockDb.execute.mockResolvedValue([mockUser]);
		const result = await fetchUserProfile(mockDb, mockUser.userID);

		expect(mockDb.execute).toHaveBeenCalled();
		expect(typeof result).toBe("object");
		expect(result).toHaveProperty("userID");
		expect(result).toHaveProperty("firstName");
		expect(result).toHaveProperty("lastName");
		expect(result).toHaveProperty("email");
		expect(result).toHaveProperty("country");
		expect(result).toHaveProperty("timezone");
	});

	test("Throw an error for trying to fetch user details without user ID", async () => {
		await expect(fetchUserProfile(mockDb, "")).rejects.toThrow(
			"Insufficient data for fetching user profile.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});
});

describe("fetchUserProfileByEmail", () => {
	test("Should fetch a user profile from user Email", async () => {
		mockDb.execute.mockResolvedValue([mockUser]);
		const result = await fetchUserProfileByEmail(mockDb, mockUser.email);

		expect(mockDb.execute).toHaveBeenCalled();
		expect(typeof result).toBe("object");
		expect(result).toHaveProperty("userID");
		expect(result).toHaveProperty("firstName");
		expect(result).toHaveProperty("lastName");
		expect(result).toHaveProperty("email");
		expect(result).toHaveProperty("country");
		expect(result).toHaveProperty("timezone");
	});

	test("Throw an error for trying to fetch user details without email address", async () => {
		await expect(fetchUserProfileByEmail(mockDb, "")).rejects.toThrow(
			"Email address is required to fetch user details.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});
});

describe("createUserWithGoogleInfo", () => {
	test("Should create a user profile with provided Google info", async () => {
		generateUUID.mockReturnValue(mockUser.userID);
		const result = await createUserWithGoogleInfo(mockDb, {
			firstName: mockUser.firstName,
			lastName: mockUser.lastName,
			email: mockUser.email,
		});

		expect(generateUUID).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toEqual({
			userID: expect.any(String),
			firstName: mockUser.firstName,
			lastName: mockUser.lastName,
			email: mockUser.email,
		});
	});

	test("Throw an error for not providing enough data", async () => {
		await expect(
			createUserWithGoogleInfo(mockDb, {
				email: mockUser.email,
			}),
		).rejects.toThrow(
			"Insufficient data for creating a user profile using Google.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Throw an error for not having database error", async () => {
		validateDbResp.mockReturnValue(false);
		await expect(
			createUserWithGoogleInfo(mockDb, {
				firstName: mockUser.firstName,
				lastName: mockUser.lastName,
				email: mockUser.email,
			}),
		).rejects.toThrow("Unable to create a user profile using Google.");
		expect(mockDb.execute).toHaveBeenCalled();
	});
});
