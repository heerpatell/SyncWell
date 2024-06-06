const {
	updateAvailabilityByDates,
	removeAvailabilityByDay,
	updateAvailabilityByDay,
	fetchUserAvailabilities,
	fetchIsUserAvailabilitySet,
} = require("./availability");
const { validateDbResp, capitalizeFirstLetter } = require("../util");

const mockDb = {
	execute: jest.fn(),
	beginTransaction: jest.fn(),
	commit: jest.fn(),
	abortTransaction: jest.fn(),
};

jest.mock("../util", () => ({
	validateDbResp: jest.fn(),
	capitalizeFirstLetter: jest.fn((str) => str),
}));

const mockData = {
	userID: "qwerty123",
	day: "mon",
	dates: ["2024-02-01", "2024-02-02"],
	schedule: [
		{
			startTime: "11:00",
			endTime: "12:00",
		},
	],
	availabilityID: 1,
};

const mockUserAvailabilities = {
	availability: {
		mon: [
			{
				id: 1,
				startTime: "09:00",
				endTime: "17:00",
			},
		],
		tue: [],
		wed: [],
		thu: [],
		fri: [],
		sat: [],
		sun: [],
		dates: [],
	},
};

beforeEach(() => {
	validateDbResp.mockReturnValue([{}]);
	mockDb.execute.mockResolvedValue([{}]);
});
afterEach(() => {
	jest.clearAllMocks();
});

describe("updateAvailabilityByDates", () => {
	test("Should update availability by dates", async () => {
		const result = await updateAvailabilityByDates(
			mockDb,
			mockData.userID,
			{
				dates: mockData.dates,
				schedule: mockData.schedule,
			},
		);

		expect(result).toBe(true);
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});

	test("Should throw an error for invalid data", async () => {
		await expect(
			updateAvailabilityByDates(mockDb, "", {
				dates: mockData.dates,
				schedule: mockData.schedule,
			}),
		).rejects.toThrow("Invalid data for adding availability by dates.");
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error if date or time is not selected", async () => {
		await expect(
			updateAvailabilityByDates(mockDb, mockData.userID, {
				dates: [],
				schedule: mockData.schedule,
			}),
		).rejects.toThrow("Date or time is not selected to override.");
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error if unable to delete existing dates", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			updateAvailabilityByDates(mockDb, mockData.userID, {
				dates: mockData.dates,
				schedule: mockData.schedule,
			}),
		).rejects.toThrow("Unable to save date availabilities.");
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});

	test("Should throw an error if unable to add new dates", async () => {
		validateDbResp.mockReturnValueOnce([{}]).mockReturnValueOnce(false);
		await expect(
			updateAvailabilityByDates(mockDb, mockData.userID, {
				dates: mockData.dates,
				schedule: mockData.schedule,
			}),
		).rejects.toThrow("Unable to save date availabilities.");
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});
});

describe("updateAvailabilityByDay", () => {
	test("Should update availability by day", async () => {
		mockDb.execute.mockResolvedValueOnce([
			{
				insertId: mockData.availabilityID,
			},
		]);
		const result = await updateAvailabilityByDay(
			mockDb,
			mockData.userID,
			mockData.day,
			{
				startTime: mockData.schedule[0].startTime,
				endTime: mockData.schedule[0].endTime,
			},
		);

		expect(result).toEqual({
			userID: mockData.userID,
			day: mockData.day,
			schedule: {
				id: mockData.availabilityID,
				startTime: mockData.schedule[0].startTime,
				endTime: mockData.schedule[0].endTime,
			},
		});
		expect(capitalizeFirstLetter).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});

	test("Should throw an error for invalid data", async () => {
		await expect(
			updateAvailabilityByDay(mockDb, mockData.userID, mockData.day, {
				startTime: mockData.schedule[0].startTime,
				endTime: "",
			}),
		).rejects.toThrow("Invalid data for adding availability by dates.");
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error if unable to save day availabilities", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			updateAvailabilityByDay(mockDb, mockData.userID, mockData.day, {
				...mockData.schedule[0],
			}),
		).rejects.toThrow("Unable to save day availabilities.");
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});
});

describe("removeAvailabilityByDay", () => {
	test("Should remove availability by day", async () => {
		mockDb.execute.mockResolvedValueOnce([
			{
				affectedRows: 1,
			},
		]);

		const result = await removeAvailabilityByDay(
			mockDb,
			mockData.userID,
			mockData.day,
			mockData.availabilityID,
		);

		expect(result).toEqual({
			userID: mockData.userID,
			day: mockData.day,
			availabilityID: mockData.availabilityID,
		});
		expect(capitalizeFirstLetter).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});

	test("Should throw an error for invalid data", async () => {
		await expect(
			removeAvailabilityByDay(mockDb, "", mockData.day, {
				availabilityID: mockData.availabilityID,
			}),
		).rejects.toThrow("Invalid data for removing availability by day.");
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error if unable to locate availability for a given day", async () => {
		mockDb.execute = jest.fn().mockResolvedValue([
			{
				affectedRows: 0,
			},
		]);

		await expect(
			removeAvailabilityByDay(mockDb, mockData.userID, mockData.day, {
				availabilityID: mockData.availabilityID,
			}),
		).rejects.toThrow("Unable to locate given availability.");
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});

	test("Should throw an error if unable to remove availability for a given day", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			removeAvailabilityByDay(mockDb, mockData.userID, mockData.day, {
				availabilityID: mockData.availabilityID,
			}),
		).rejects.toThrow("Unable to remove given day availability.");
		expect(mockDb.execute).toHaveBeenCalled();
	});
});

describe("fetchUserAvailabilities", () => {
	test("Should fetch user availabilities", async () => {
		mockDb.execute.mockResolvedValueOnce([[mockUserAvailabilities]]);

		const result = await fetchUserAvailabilities(mockDb, mockData.userID);

		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(result).toEqual(mockUserAvailabilities);
	});

	test("Should throw an error for invalid data", async () => {
		await expect(fetchUserAvailabilities(mockDb, "")).rejects.toThrow(
			"Invalid data for fetching user availabilities.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error if unable to fetch availability", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			fetchUserAvailabilities(mockDb, mockData.userID),
		).rejects.toThrow("Unable to fetch availability for given user.");
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});
});

describe("fetchIsUserAvailabilitySet", () => {
	test("Should fetch if user has set their availabilities or not", async () => {
		mockDb.execute.mockResolvedValueOnce([[
			{
				isSet: true
			}
		]]);

		const result = await fetchIsUserAvailabilitySet(mockDb, mockData.userID);

		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(result).toEqual({
			isSet: expect.any(Boolean),
		});
	});

	test("Should throw an error for invalid data", async () => {
		await expect(fetchIsUserAvailabilitySet(mockDb, "")).rejects.toThrow(
			"Invalid data for checking user availabilities.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error if unable to check availability", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			fetchIsUserAvailabilitySet(mockDb, mockData.userID),
		).rejects.toThrow("Unable to check availability for given user.");
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
	});
});
