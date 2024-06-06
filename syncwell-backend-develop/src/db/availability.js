const { capitalizeFirstLetter, validateDbResp } = require("../util");

async function updateAvailabilityByDates(db, userID, { dates, schedule }) {
	if (!userID || !Array.isArray(dates) || !Array.isArray(schedule)) {
		throw new Error("Invalid data for adding availability by dates.");
	}
	if (!dates.length || !schedule.length) {
		throw new Error("Date or time is not selected to override.");
	}

	const params = [];
	const insertStatements = [];
	for (let date of dates) {
		for (let timing of schedule) {
			insertStatements.push("(UNHEX(?), ?, ?, ?)");
			params.push(userID, date, timing.startTime, timing.endTime);
		}
	}
	const resp = await db.execute(
		"DELETE FROM DateAvailabilities WHERE userID = UNHEX(?) AND date IN (?)",
		[userID, dates],
	);
	if (validateDbResp(resp)) {
		const resp = await db.execute(
			"INSERT INTO DateAvailabilities(userID, date, startTime, endTime) VALUES" +
				insertStatements.join(", "),
			params,
		);
		if (validateDbResp(resp)) {
			return true;
		}
	}
	throw new Error("Unable to save date availabilities.");
}

async function updateAvailabilityByDay(
	db,
	userID,
	day,
	{ startTime, endTime },
) {
	if (!userID || !day || !startTime || !endTime) {
		throw new Error("Invalid data for adding availability by dates.");
	}
	const resp = await db.execute(
		`INSERT INTO ${capitalizeFirstLetter(day)}Availabilities(userID, startTime, endTime) VALUES(UNHEX(?), ?, ?)`,
		[userID, startTime, endTime],
	);
	if (validateDbResp(resp)) {
		return {
			userID,
			day,
			schedule: {
				id: resp[0].insertId,
				startTime,
				endTime,
			},
		};
	}
	throw new Error("Unable to save day availabilities.");
}

async function removeAvailabilityByDay(db, userID, day, availabilityID) {
	if (!userID || !day || !availabilityID) {
		throw new Error("Invalid data for removing availability by day.");
	}
	const resp = await db.execute(
		`DELETE FROM ${capitalizeFirstLetter(day)}Availabilities WHERE userID = UNHEX(?) AND id = ?`,
		[userID, availabilityID],
	);

	if (validateDbResp(resp)) {
		if (!resp[0].affectedRows)
			throw new Error("Unable to locate given availability.");
		return {
			userID,
			day,
			availabilityID,
		};
	}
	throw new Error("Unable to remove given day availability.");
}

async function fetchUserAvailabilities(db, userID) {
	if (!userID) {
		throw new Error("Invalid data for fetching user availabilities.");
	}
	const [results] = await db.execute(
		`
		SELECT
			JSON_OBJECT(
				'mon', (SELECT IF(COUNT(id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'id', id,
						'startTime', DATE_FORMAT(startTime, '%H:%i'),
						'endTime', DATE_FORMAT(endTime, '%H:%i')
					)
				)) FROM MonAvailabilities mon WHERE userID = Users.userID),
				'tue', (SELECT IF(COUNT(id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'id', id,
						'startTime', DATE_FORMAT(startTime, '%H:%i'),
						'endTime', DATE_FORMAT(endTime, '%H:%i')
					)
				)) FROM TueAvailabilities tue WHERE userID = Users.userID),
				'wed', (SELECT IF(COUNT(id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'id', id,
						'startTime', DATE_FORMAT(startTime, '%H:%i'),
						'endTime', DATE_FORMAT(endTime, '%H:%i')
					)
				)) FROM WedAvailabilities wed WHERE userID = Users.userID),
				'thu', (SELECT IF(COUNT(id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'id', id,
						'startTime', DATE_FORMAT(startTime, '%H:%i'),
						'endTime', DATE_FORMAT(endTime, '%H:%i')
					)
				)) FROM ThuAvailabilities thu WHERE userID = Users.userID),
				'fri', (SELECT IF(COUNT(id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'id', id,
						'startTime', DATE_FORMAT(startTime, '%H:%i'),
						'endTime', DATE_FORMAT(endTime, '%H:%i')
					)
				)) FROM FriAvailabilities fri WHERE userID = Users.userID),
				'sat', (SELECT IF(COUNT(id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'id', id,
						'startTime', DATE_FORMAT(startTime, '%H:%i'),
						'endTime', DATE_FORMAT(endTime, '%H:%i')
					)
				)) FROM SatAvailabilities sat WHERE userID = Users.userID),
				'sun', (SELECT IF(COUNT(id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'id', id,
						'startTime', DATE_FORMAT(startTime, '%H:%i'),
						'endTime', DATE_FORMAT(endTime, '%H:%i')
					)
				)) FROM SunAvailabilities sun WHERE userID = Users.userID),
				'dates', (SELECT IF(COUNT(id) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'id', id,
						'date', date,
						'startTime', DATE_FORMAT(startTime, '%H:%i'),
						'endTime', DATE_FORMAT(endTime, '%H:%i')
					)
				)) FROM DateAvailabilities dates WHERE userID = Users.userID)
			) as availability
		FROM Users WHERE userID = UNHEX(?)
		`,
		[userID],
	);

	if (validateDbResp(results) && results[0].availability) {
		return results[0];
	}
	throw new Error("Unable to fetch availability for given user.");
}

async function fetchIsUserAvailabilitySet(db, userID) {
	if (!userID) {
		throw new Error("Invalid data for checking user availabilities.");
	}

	const [results] = await db.execute(
		`
		SELECT
			IF(
				(
					(SELECT COUNT(id) FROM MonAvailabilities WHERE userID = UNHEX(?)) +
					(SELECT COUNT(id) FROM TueAvailabilities WHERE userID = UNHEX(?)) +
					(SELECT COUNT(id) FROM WedAvailabilities WHERE userID = UNHEX(?)) +
					(SELECT COUNT(id) FROM ThuAvailabilities WHERE userID = UNHEX(?)) +
					(SELECT COUNT(id) FROM FriAvailabilities WHERE userID = UNHEX(?)) +
					(SELECT COUNT(id) FROM SatAvailabilities WHERE userID = UNHEX(?)) +
					(SELECT COUNT(id) FROM SunAvailabilities WHERE userID = UNHEX(?)) +
					(SELECT COUNT(id) FROM DateAvailabilities WHERE userID = UNHEX(?))
				) > 0,
				TRUE,
				FALSE
			) as isSet
		`,
		[userID, userID, userID, userID, userID, userID, userID, userID],
	);

	if (validateDbResp(results)) {
		return {
			isSet: results[0].isSet === 1,
		};
	}

	throw new Error("Unable to check availability for given user.");
}

module.exports = {
	updateAvailabilityByDates,
	updateAvailabilityByDay,
	removeAvailabilityByDay,
	fetchUserAvailabilities,
	fetchIsUserAvailabilitySet,
};
