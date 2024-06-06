let {
	fetchMeetDetails,
	setMeetMediums,
	createMeet,
	updateMeetDetails,
	removeMeet,
	scheduleMeet,
	cancelMeetInDb,
	fetchMeetsByUserID,
} = require("./meets");
const { generateUUID, validateDbResp } = require("../util");

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

const mockMeetDetails = {
	meetID: "asdfgh4321",
	host: {
		userID: "abcdef",
		email: "host@syncwell.com",
		firstName: "John",
		lastName: "Doe",
	},
	invitee: {
		userID: "123456",
		email: "invitee@syncwell.com",
		firstName: "Jane",
		lastName: "Doe",
	},
	meetTitle: "Test Meet",
	durationInMin: 30,
	meetDesc: "Testing meet details",
	mediums: [
		{
			mediumID: "1",
			mediumName: "Phone call",
		},
		{
			mediumID: "2",
			mediumName: "Google Meet",
		},
	],
	scheduledDetails: {
		scheduledDate: "2022-12-31",
		scheduledTime: "10:00 AM",
	},
};

const mockMeetScheduleDetails = {
	meetingLinkOrPhone: "https://example.com/meeting",
	msgFromInvitee: "Hello, let's meet!",
};

beforeEach(() => {
	validateDbResp.mockReturnValue([{}]);
	mockDb.execute.mockResolvedValue([{}]);
});
afterEach(() => {
	jest.clearAllMocks();
});

describe("fetchMeetDetails", () => {
	test("Should fetch meet details when meetID is provided", async () => {
		mockDb.execute.mockResolvedValueOnce([
			[
				{
					meetDetails: mockMeetDetails,
				},
			],
		]);

		const result = await fetchMeetDetails(mockDb, mockMeetDetails.meetID);
		expect(mockDb.execute).toHaveBeenCalledWith(
			expect.any(String),
			expect.arrayContaining([
				mockMeetDetails.meetID,
				mockMeetDetails.meetID,
				mockMeetDetails.meetID,
			]),
		);
		expect(result).toEqual(mockMeetDetails);
	});

	test("Should throw an error when meetID is not provided", async () => {
		await expect(fetchMeetDetails(mockDb, "")).rejects.toThrow(
			"Insufficient data to update a meet.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error when meet details are not found", async () => {
		mockDb.execute.mockResolvedValueOnce([]);
		await expect(
			fetchMeetDetails(mockDb, mockMeetDetails.meetID),
		).rejects.toThrow("Unable to find the meet details.");
		expect(mockDb.execute).toHaveBeenCalledWith(
			expect.any(String),
			expect.arrayContaining([
				mockMeetDetails.meetID,
				mockMeetDetails.meetID,
				mockMeetDetails.meetID,
			]),
		);
	});
});

describe("setMeetMediums", () => {
	test("Should insert meet mediums into the database", async () => {
		mockDb.beginTransaction.mockResolvedValue({});
		const conn = mockDb.beginTransaction();
		await setMeetMediums(
			mockDb,
			conn,
			mockMeetDetails.meetID,
			mockMeetDetails.mediums.map((medium) => medium.mediumID),
		);
		expect(mockDb.execute).toHaveBeenCalled();
	});
});

describe("createMeet", () => {
	test("Should create a meet with valid data", async () => {
		mockDb.beginTransaction.mockResolvedValue({});

		generateUUID.mockReturnValueOnce(mockMeetDetails.meetID);

		const result = await createMeet(mockDb, {
			hostID: mockMeetDetails.host.userID,
			inviteeID: mockMeetDetails.invitee.userID,
			meetTitle: mockMeetDetails.meetTitle,
			durationInMin: mockMeetDetails.durationInMin,
			meetDesc: mockMeetDetails.meetDesc,
			mediums: mockMeetDetails.mediums.map((medium) => medium.mediumID),
		});
		expect(mockDb.beginTransaction).toHaveBeenCalled();
		expect(generateUUID).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.commit).toHaveBeenCalled();
		expect(result).toHaveProperty("meetID");
		expect(result).toHaveProperty("meetTitle");
		expect(result).toHaveProperty("durationInMin");
		expect(result).toHaveProperty("meetDesc");
		expect(result).toHaveProperty("mediums");
	});

	test("Should throw an error with insufficient data", async () => {
		await expect(
			createMeet(mockDb, {
				hostID: mockMeetDetails.host.userID,
				inviteeID: mockMeetDetails.invitee.userID,
				meetTitle: "",
				durationInMin: mockMeetDetails.durationInMin,
				meetDesc: mockMeetDetails.meetDesc,
				mediums: mockMeetDetails.mediums.map(
					(medium) => medium.mediumID,
				),
			}),
		).rejects.toThrow("Insufficient data for creating a meet.");

		expect(mockDb.beginTransaction).not.toHaveBeenCalled();
		expect(mockDb.execute).not.toHaveBeenCalled();
		expect(mockDb.abortTransaction).not.toHaveBeenCalled();
	});

	test("Should throw an error when database operations fail", async () => {
		mockDb.execute.mockResolvedValueOnce(false);
		validateDbResp.mockReturnValue(false);
		await expect(
			createMeet(mockDb, {
				hostID: mockMeetDetails.host.userID,
				inviteeID: mockMeetDetails.invitee.userID,
				meetTitle: mockMeetDetails.meetTitle,
				durationInMin: mockMeetDetails.durationInMin,
				meetDesc: mockMeetDetails.meetDesc,
				mediums: mockMeetDetails.mediums.map(
					(medium) => medium.mediumID,
				),
			}),
		).rejects.toThrow("Unable to create a meet.");

		expect(mockDb.beginTransaction).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(mockDb.abortTransaction).toHaveBeenCalled();
	});

	test("Should throw an error when adding in setMeetMediums fails", async () => {
		validateDbResp.mockResolvedValueOnce([{}]).mockReturnValueOnce(false);
		await expect(
			createMeet(mockDb, {
				hostID: mockMeetDetails.host.userID,
				inviteeID: mockMeetDetails.invitee.userID,
				meetTitle: mockMeetDetails.meetTitle,
				durationInMin: mockMeetDetails.durationInMin,
				meetDesc: mockMeetDetails.meetDesc,
				mediums: mockMeetDetails.mediums.map(
					(medium) => medium.mediumID,
				),
			}),
		).rejects.toThrow("Unable to create a meet.");

		expect(mockDb.beginTransaction).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(mockDb.abortTransaction).toHaveBeenCalled();
	});
});

describe("updateMeetDetails", () => {
	test("Should update meet details with valid data", async () => {
		const result = await updateMeetDetails(mockDb, mockMeetDetails.meetID, {
			meetTitle: mockMeetDetails.meetTitle,
			meetDesc: mockMeetDetails.meetDesc,
			durationInMin: mockMeetDetails.durationInMin,
			mediums: mockMeetDetails.mediums.map((medium) => medium.mediumID),
		});

		expect(mockDb.beginTransaction).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.commit).toHaveBeenCalled();

		expect(result).toEqual({
			meetID: mockMeetDetails.meetID,
			meetTitle: mockMeetDetails.meetTitle,
			durationInMin: mockMeetDetails.durationInMin,
			meetDesc: mockMeetDetails.meetDesc,
			mediums: mockMeetDetails.mediums.map((medium) => medium.mediumID),
		});
	});

	test("Should throw an error with insufficient data", async () => {
		await expect(
			updateMeetDetails(mockDb, mockMeetDetails.meetID, {
				meetTitle: "",
				meetDesc: mockMeetDetails.meetDesc,
				durationInMin: mockMeetDetails.durationInMin,
				mediums: mockMeetDetails.mediums.map(
					(medium) => medium.mediumID,
				),
			}),
		).rejects.toThrow("Insufficient data to update a meet.");

		expect(mockDb.beginTransaction).not.toHaveBeenCalled();
		expect(mockDb.execute).not.toHaveBeenCalled();
		expect(mockDb.abortTransaction).not.toHaveBeenCalled();
	});

	test("Should throw an error when database operations fail", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			updateMeetDetails(mockDb, mockMeetDetails.meetID, {
				meetTitle: mockMeetDetails.meetTitle,
				meetDesc: mockMeetDetails.meetDesc,
				durationInMin: mockMeetDetails.durationInMin,
				mediums: mockMeetDetails.mediums.map(
					(medium) => medium.mediumID,
				),
			}),
		).rejects.toThrow("Unable to update a meet.");

		expect(mockDb.beginTransaction).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(mockDb.abortTransaction).toHaveBeenCalled();
	});

	test("Should throw an error when deleting in setMeetMediums fails", async () => {
		validateDbResp.mockResolvedValueOnce([{}]).mockReturnValueOnce(false);
		await expect(
			updateMeetDetails(mockDb, mockMeetDetails.meetID, {
				meetTitle: mockMeetDetails.meetTitle,
				meetDesc: mockMeetDetails.meetDesc,
				durationInMin: mockMeetDetails.durationInMin,
				mediums: mockMeetDetails.mediums.map(
					(medium) => medium.mediumID,
				),
			}),
		).rejects.toThrow("Unable to update a meet.");

		expect(mockDb.beginTransaction).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(mockDb.abortTransaction).toHaveBeenCalled();
	});

	test("Should throw an error when adding in setMeetMediums fails", async () => {
		validateDbResp
			.mockResolvedValueOnce([{}])
			.mockResolvedValueOnce([{}])
			.mockReturnValueOnce(false);
		await expect(
			updateMeetDetails(mockDb, mockMeetDetails.meetID, {
				meetTitle: mockMeetDetails.meetTitle,
				meetDesc: mockMeetDetails.meetDesc,
				durationInMin: mockMeetDetails.durationInMin,
				mediums: mockMeetDetails.mediums.map(
					(medium) => medium.mediumID,
				),
			}),
		).rejects.toThrow("Unable to update a meet.");

		expect(mockDb.beginTransaction).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(mockDb.abortTransaction).toHaveBeenCalled();
	});
});

describe("removeMeet", () => {
	test("Should remove a meet with valid meetID", async () => {
		const result = await removeMeet(mockDb, mockMeetDetails.meetID);
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toEqual({
			meetID: mockMeetDetails.meetID,
		});
	});

	test("Should throw an error with insufficient data", async () => {
		await expect(removeMeet(mockDb, "")).rejects.toThrow(
			"Insufficient data to remove a meet.",
		);
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error when unable to delete a meet", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			removeMeet(mockDb, mockMeetDetails.meetID),
		).rejects.toThrow("Unable to delete a meet.");
		expect(mockDb.execute).toHaveBeenCalled();
	});
});

describe("scheduleMeet", () => {
	test("Should schedule a meet with valid data", async () => {
		const result = await scheduleMeet(mockDb, mockMeetDetails.meetID, {
			scheduledDate: mockMeetDetails.scheduledDetails.scheduledDate,
			scheduledTime: mockMeetDetails.scheduledDetails.scheduledTime,
			mediumID: mockMeetDetails.mediums[0].mediumID,
			meetingLinkOrPhone: mockMeetScheduleDetails.meetingLinkOrPhone,
			msgFromInvitee: mockMeetScheduleDetails.msgFromInvitee,
		});

		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toEqual({
			meetID: mockMeetDetails.meetID,
			scheduledDate: mockMeetDetails.scheduledDetails.scheduledDate,
			scheduledTime: mockMeetDetails.scheduledDetails.scheduledTime,
			meetingLinkOrPhone: mockMeetScheduleDetails.meetingLinkOrPhone,
			msgFromInvitee: mockMeetScheduleDetails.msgFromInvitee,
		});
	});

	test("Should throw an error with insufficient data", async () => {
		await expect(
			scheduleMeet(mockDb, mockMeetDetails.meetID, {
				scheduledDate: mockMeetDetails.scheduledDetails.scheduledDate,
				scheduledTime: mockMeetDetails.scheduledDetails.scheduledTime,
				mediumID: mockMeetDetails.mediums[0].mediumID,
				meetingLinkOrPhone: "",
			}),
		).rejects.toThrow("Insufficient data to schedule a meet.");

		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error when unable to schedule a meet", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			scheduleMeet(mockDb, mockMeetDetails.meetID, {
				scheduledDate: mockMeetDetails.scheduledDetails.scheduledDate,
				scheduledTime: mockMeetDetails.scheduledDetails.scheduledTime,
				mediumID: mockMeetDetails.mediums[0].mediumID,
				meetingLinkOrPhone: mockMeetScheduleDetails.meetingLinkOrPhone,
			}),
		).rejects.toThrow("Unable to schedule a meet.");

		expect(mockDb.execute).toHaveBeenCalled();
	});
});

describe("fetchMeetsByUserID", () => {
	test("Should list all the meet details for a user - host", async () => {
		mockDb.execute.mockResolvedValueOnce([
			[
				{
					availability: {
						past: [],
						schedule: [],
					},
				},
			],
		]);

		const result = await fetchMeetsByUserID(
			mockDb,
			mockMeetDetails.host.userID,
			{
				as: "host",
				limit: 10,
			},
		);
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toHaveProperty("availability");
	});

	test("Should list all the meet details for a user - attendee", async () => {
		mockDb.execute.mockResolvedValueOnce([
			[
				{
					availability: {
						past: [],
						schedule: [],
					},
				},
			],
		]);

		const result = await fetchMeetsByUserID(
			mockDb,
			mockMeetDetails.host.userID,
			{
				as: "attendee",
			},
		);
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toHaveProperty("availability");
	});

	test("Should list all the meet details for a user - both", async () => {
		mockDb.execute.mockResolvedValueOnce([
			[
				{
					availability: {
						past: [],
						schedule: [],
					},
				},
			],
		]);

		const result = await fetchMeetsByUserID(
			mockDb,
			mockMeetDetails.host.userID,
			{
				as: "both",
			},
		);
		expect(mockDb.execute).toHaveBeenCalled();
		expect(result).toHaveProperty("availability");
	});

	test("Should throw an error for not providing user role", async () => {
		await expect(
			fetchMeetsByUserID(mockDb, mockMeetDetails.host.userID),
		).rejects.toThrow("User role must required to fetch meets.");
	});

	test("Should throw an error for getting database error", async () => {
		validateDbResp.mockReturnValue(false);
		await expect(
			fetchMeetsByUserID(mockDb, mockMeetDetails.host.userID, {
				as: "host",
			}),
		).rejects.toThrow("Unable to fetch meets.");
	});
});

describe("cancelMeetInDb", () => {
	test("Should cancel a meet", async () => {
		const result = await cancelMeetInDb(mockDb, mockMeetDetails.meetID, {
			cancelledBy: mockMeetDetails.host.userID,
			reason: "Something came up!",
		});

		expect(mockDb.beginTransaction).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.commit).toHaveBeenCalled();

		expect(result).toEqual({
			meetID: mockMeetDetails.meetID,
		});
	});

	test("Should throw an error with insufficient data", async () => {
		await expect(
			cancelMeetInDb(mockDb, mockMeetDetails.meetID, {
				cancelledBy: mockMeetDetails.host.userID,
				reason: "",
			}),
		).rejects.toThrow("Insufficient data to cancel a meet.");
		expect(mockDb.execute).not.toHaveBeenCalled();
	});

	test("Should throw an error when unable to cancel a meet", async () => {
		validateDbResp.mockReturnValueOnce(false);
		await expect(
			cancelMeetInDb(mockDb, mockMeetDetails.meetID, {
				cancelledBy: mockMeetDetails.host.userID,
				reason: "Something came up!",
			}),
		).rejects.toThrow("Unable to cancel a meet.");

		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.abortTransaction).toHaveBeenCalled();
	});

	test("Should throw an error when unable update meet details in CancelledMeets", async () => {
		validateDbResp.mockReturnValueOnce([{}]).mockReturnValueOnce(false);
		await expect(
			cancelMeetInDb(mockDb, mockMeetDetails.meetID, {
				cancelledBy: mockMeetDetails.host.userID,
				reason: "Something came up!",
			}),
		).rejects.toThrow("Unable to cancel a meet.");

		expect(mockDb.execute).toHaveBeenCalled();
		expect(validateDbResp).toHaveBeenCalled();
		expect(mockDb.abortTransaction).toHaveBeenCalled();
	});
});
