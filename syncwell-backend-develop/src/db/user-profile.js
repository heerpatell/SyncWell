const { generateUUID, validateDbResp } = require("../util");

async function createUserWithEmail(db, { email }) {
	if (!email) {
		throw new Error("Insufficient data for creating a user profile.");
	}

	const userID = generateUUID();
	const resp = await db.execute(
		"INSERT INTO Users(userID, email) VALUES(UNHEX(?), ?)",
		[userID, email],
	);
	if (validateDbResp(resp)) {
		return {
			userID,
			email,
		};
	}
	throw new Error("Unable to create a user profile.");
}

async function updateUserProfile(
	db,
	userID,
	{ firstName, lastName, country, timezone },
) {
	if (!firstName || !lastName || !country || !timezone) {
		throw new Error("Insufficient data for updating a user profile.");
	}

	const resp = await db.execute(
		"UPDATE Users SET firstName = ?, lastName = ?, country = ?, timezone = ? WHERE userID = UNHEX(?)",
		[firstName, lastName, country, timezone, userID],
	);
	if (validateDbResp(resp)) {
		return {
			userID,
			firstName,
			lastName,
			country,
			timezone,
		};
	}
	throw new Error("Unable to update a user profile.");
}

async function createUserWithGoogleInfo(db, { firstName, lastName, email }) {
	if (!firstName || !lastName || !email) {
		throw new Error(
			"Insufficient data for creating a user profile using Google.",
		);
	}

	const userID = generateUUID();

	const resp = await db.execute(
		"INSERT INTO Users(userID, email, firstName, lastName) VALUES(UNHEX(?), ?, ?, ?)",
		[userID, email, firstName, lastName],
	);
	if (validateDbResp(resp)) {
		return {
			userID,
			firstName,
			lastName,
			email,
		};
	}
	throw new Error("Unable to create a user profile using Google.");
}

async function fetchUserProfile(db, userID) {
	if (!userID)
		throw new Error("Insufficient data for fetching user profile.");

	const [results] = await db.execute(
		"SELECT HEX(userID) as userID, firstName, lastName, email, country, timezone FROM Users WHERE userID = UNHEX(?) AND isActive = 1",
		[userID],
	);
	return results;
}

async function fetchUserProfileByEmail(db, email) {
	if (!email)
		throw new Error("Email address is required to fetch user details.");

	const [results] = await db.execute(
		"SELECT HEX(userID) as userID, firstName, lastName, email, country, timezone FROM Users WHERE email = ? AND isActive = 1",
		[email],
	);
	return results;
}

module.exports = {
	createUserWithEmail,
	updateUserProfile,
	fetchUserProfile,
	fetchUserProfileByEmail,
	createUserWithGoogleInfo,
};
