const { validateDbResp } = require("../util");

async function storeOtp(db, { userID, otpNum }) {
	if (!userID || !otpNum) {
		throw new Error("Invalid data for storing OTP.");
	}

	const resp = await db.execute(
		"INSERT INTO LoginAttempts (userID, otpNum) VALUES (UNHEX(?), ?)",
		[userID, otpNum],
	);
	if (validateDbResp(resp)) {
		return true;
	}
	throw new Error("Unable to store OTP.");
}

async function verifyOtp(db, { userID, otpNum }) {
	if (!userID || !otpNum) {
		throw new Error("Invalid data for verifying OTP.");
	}

	const [results] = await db.execute(
		"SELECT userID FROM LoginAttempts WHERE userID = UNHEX(?) AND otpNum = ?",
		[userID, otpNum],
	);
	if (validateDbResp(results)) {
		return true;
	}
	throw new Error("Invalid OTP");
}

async function saveToken(
	db,
	userID,
	{ tokens: { access_token, refresh_token, expiry_date } },
	authCode,
) {
	if (!access_token || !refresh_token || !expiry_date) {
		throw new Error("Invalid data for saving tokens.");
	}

	const resp = await db.execute(
		"REPLACE INTO OAuthTokens (userID, accessToken, refreshToken, expiryDate, authCode) VALUES (UNHEX(?), ?, ?, ?, ?)",
		[userID, access_token, refresh_token, expiry_date, authCode],
	);

	if (validateDbResp(resp)) {
		return true;
	}
	throw new Error("Unable to save tokens.");
}

async function fetchOAuthToken(db, userID) {
	if (!userID) {
		throw new Error("Invalid data for fetching tokens.");
	}

	const [results] = await db.execute(
		"SELECT authCode, accessToken, refreshToken, expiryDate FROM OAuthTokens WHERE userID = UNHEX(?)",
		[userID],
	);

	if (validateDbResp(results)) {
		return {
			tokenDetails: results[0],
		};
	} else
		return {
			tokenDetails: null,
		};
}

async function removeOAuthToken(db, userID) {
	if (!userID) {
		throw new Error("Invalid data for removing tokens.");
	}

	const resp = await db.execute(
		"DELETE FROM OAuthTokens WHERE userID = UNHEX(?)",
		[userID],
	);

	if (validateDbResp(resp)) {
		return true;
	}
	throw new Error("Unable to remove tokens.");
}

module.exports = {
	storeOtp,
	verifyOtp,
	saveToken,
	fetchOAuthToken,
	removeOAuthToken,
};
