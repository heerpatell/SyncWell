const { generateUUID, validateDbResp } = require("../util");

async function setMeetMediums(db, conn, meetID, mediums) {
	const insertQry = [];
	const params = [];
	for (let i of mediums) {
		insertQry.push("(UNHEX(?), ?)");
		params.push(meetID, i);
	}
	return await db.execute(
		"INSERT INTO MeetMediums(meetID, mediumID) VALUES" +
			insertQry.join(", "),
		params,
		conn,
	);
}

async function createMeet(
	db,
	{ hostID, inviteeID, meetTitle, durationInMin, meetDesc, mediums },
) {
	if (
		!hostID ||
		!inviteeID ||
		!meetTitle ||
		!durationInMin ||
		!meetDesc ||
		!Array.isArray(mediums) ||
		(Array.isArray(mediums) && !mediums.length)
	) {
		throw new Error("Insufficient data for creating a meet.");
	}

	const conn = await db.beginTransaction();
	try {
		const meetID = generateUUID();
		const resp = await db.execute(
			"INSERT INTO Meets(meetID, hostID, inviteeID, meetTitle, durationInMin, meetDesc) VALUES(UNHEX(?), UNHEX(?), UNHEX(?), ?, ?, ?)",
			[meetID, hostID, inviteeID, meetTitle, durationInMin, meetDesc],
			conn,
		);

		if (validateDbResp(resp)) {
			const resp = await setMeetMediums(db, conn, meetID, mediums);
			if (validateDbResp(resp)) {
				await db.commit(conn);
				return {
					meetID,
					meetTitle,
					durationInMin,
					meetDesc,
					mediums,
				};
			}
		}
		throw new Error("Unable to create a meet.");
	} catch (e) {
		await db.abortTransaction(conn);
		throw new Error(e.toString());
	}
}

async function updateMeetDetails(
	db,
	meetID,
	{ meetTitle, meetDesc, durationInMin, mediums },
) {
	if (
		!meetID ||
		!meetTitle ||
		!meetDesc ||
		!durationInMin ||
		!Array.isArray(mediums) ||
		(Array.isArray(mediums) && !mediums.length)
	) {
		throw new Error("Insufficient data to update a meet.");
	}
	const conn = await db.beginTransaction();
	try {
		const resp = await db.execute(
			"UPDATE Meets SET meetTitle = ?, meetDesc = ?, durationInMin = ? WHERE meetID = UNHEX(?)",
			[meetTitle, meetDesc, durationInMin, meetID],
			conn,
		);
		if (validateDbResp(resp)) {
			const resp = await db.execute(
				"DELETE FROM MeetMediums WHERE meetID = UNHEX(?)",
				[meetID],
			);
			if (validateDbResp(resp)) {
				const resp = await setMeetMediums(db, conn, meetID, mediums);
				if (validateDbResp(resp)) {
					await db.commit(conn);
					return {
						meetID,
						meetTitle,
						durationInMin,
						meetDesc,
						mediums,
					};
				}
			}
		}
		throw new Error("Something went wrong.");
	} catch (e) {
		await db.abortTransaction(conn);
		throw new Error("Unable to update a meet.");
	}
}

async function fetchMeetDetails(db, meetID) {
	if (!meetID) {
		throw new Error("Insufficient data to update a meet.");
	}
	const [results] = await db.execute(
		`
		SELECT
			JSON_OBJECT(
				'meetID', HEX(meetID),
				'host', JSON_OBJECT(
					'userID', HEX(host.userID),
					'email', host.email,
					'firstName', host.firstName,
					'lastName', host.lastName,
					'country', host.country,
					'timezone', host.timezone
				),
				'invitee', JSON_OBJECT(
					'userID', HEX(invitee.userID),
					'email', invitee.email,
					'firstName', invitee.firstName,
					'lastName', invitee.lastName,
					'country', invitee.country,
					'timezone', invitee.timezone
				),
				'meetTitle', meetTitle,
				'durationInMin', durationInMin,
				'meetDesc', meetDesc,
				'mediums', (SELECT IF(COUNT(m.mediumID) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'mediumID', m.mediumID,
						'mediumName', m.mediumName
					)
				)) FROM Mediums m JOIN MeetMediums mm ON m.mediumID = mm.mediumID WHERE mm.meetID = UNHEX(?)),
				'scheduledDetails', (SELECT JSON_OBJECT(
					'scheduledDate', scheduledDate,
					'scheduledTime', DATE_FORMAT(scheduledTime, '%H:%i')
				) FROM ScheduledMeets sm JOIN Meets m ON m.meetID = sm.meetID WHERE sm.meetID = UNHEX(?))
			) as meetDetails
		FROM Meets
		JOIN Users as invitee ON Meets.inviteeID = invitee.userID
		JOIN Users as host ON Meets.hostID = host.userID
		WHERE meetID = UNHEX(?) AND Meets.isActive = 1 AND host.isActive = 1;
	`,
		[meetID, meetID, meetID],
	);
	if (Array.isArray(results) && results.length) {
		return results[0]["meetDetails"];
	}
	throw new Error("Unable to find the meet details.");
}

async function removeMeet(db, meetID) {
	if (!meetID) {
		throw new Error("Insufficient data to remove a meet.");
	}
	const resp = await db.execute(
		"UPDATE Meets SET isActive = 0 WHERE meetID = UNHEX(?)",
		[meetID],
	);

	if (validateDbResp(resp)) {
		return {
			meetID,
		};
	}
	throw new Error("Unable to delete a meet.");
}

async function scheduleMeet(
	db,
	meetID,
	{
		scheduledDate,
		scheduledTime,
		mediumID,
		meetingLinkOrPhone,
		msgFromInvitee,
	},
) {
	if (
		!meetID ||
		!scheduledDate ||
		!scheduledTime ||
		!mediumID ||
		!meetingLinkOrPhone
	) {
		throw new Error("Insufficient data to schedule a meet.");
	}
	const resp = await db.execute(
		"REPLACE INTO ScheduledMeets(meetID, mediumID, scheduledDate, scheduledTime, meetingLinkOrPhone, remark, status) VALUES(UNHEX(?), ?, ?, ?, ?, ?, ?)",
		[
			meetID,
			mediumID,
			scheduledDate,
			scheduledTime,
			meetingLinkOrPhone,
			msgFromInvitee || null,
			"Scheduled",
		],
	);

	if (validateDbResp(resp)) {
		return {
			meetID,
			scheduledDate,
			scheduledTime,
			meetingLinkOrPhone,
			msgFromInvitee,
		};
	}
	throw new Error("Unable to schedule a meet.");
}

async function cancelMeetInDb(db, meetID, { cancelledBy, reason }) {
	if (!meetID || !cancelledBy || !reason) {
		throw new Error("Insufficient data to cancel a meet.");
	}
	const conn = await db.beginTransaction();
	try {
		const resp = await db.execute(
			'UPDATE ScheduledMeets SET status = "Cancelled" WHERE meetID = UNHEX(?)',
			[meetID],
			conn,
		);
		if (validateDbResp(resp)) {
			const resp = await db.execute(
				"INSERT INTO CancelledMeets(meetID, cancelledBy, reason) VALUES(UNHEX(?), UNHEX(?), ?)",
				[meetID, cancelledBy, reason],
			);
			if (validateDbResp(resp)) {
				await db.commit(conn);
				return {
					meetID,
				};
			}
		}
		throw new Error();
	} catch (e) {
		await db.abortTransaction(conn);
		throw new Error("Unable to cancel a meet.");
	}
}

async function fetchMeetsByUserID(db, userID, filters) {
	if (!filters || !filters.as) {
		throw new Error("User role must required to fetch meets.");
	}

	let limitClause = "";

	if (filters.limit && !isNaN(filters.limit) && filters.limit > 0) {
		limitClause = `LIMIT ${filters.limit}`;
	}

	let userTypeCondition = "hostID = UNHEX(?)";

	if (filters.as === "attendee") {
		userTypeCondition = "inviteeID = UNHEX(?)";
	} else if (filters.as === "both") {
		userTypeCondition = "(hostID = UNHEX(?) OR inviteeID = UNHEX(?))";
	}

	const [results] = await db.execute(
		`
		SELECT JSON_OBJECT(
			'scheduled', (
				SELECT IF(COUNT(meetID) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'meetID', HEX(meetID),
						'meetTitle', meetTitle,
						'durationInMin', durationInMin,
						'meetDesc', meetDesc,
						'invitee', JSON_OBJECT(
							'userID', HEX(invitee.userID),
							'email', invitee.email,
							'firstName', invitee.firstName,
							'lastName', invitee.lastName
						),
						'host', JSON_OBJECT(
							'userID', HEX(host.userID),
							'email', host.email,
							'firstName', host.firstName,
							'lastName', host.lastName
						),
						'schedule', JSON_OBJECT(
							'date', scheduledDate,
							'time', DATE_FORMAT(scheduledTime, '%H:%i'),
							'place', meetingLinkOrPhone,
							'mediumID', sm.mediumID
						)
					)
				)) AS list FROM Meets AS m
				JOIN MeetMediums AS mm USING (meetID)
				JOIN ScheduledMeets AS sm USING (meetID, mediumID)
				JOIN Mediums AS md USING (mediumID)
				JOIN Users AS invitee ON m.inviteeID = invitee.userID
				JOIN Users AS host ON m.hostID = host.userID
				WHERE ${userTypeCondition} AND CONCAT(scheduledDate, ' ', scheduledTime) > CURRENT_TIMESTAMP()
				ORDER BY m.createdOn DESC ${limitClause}
			),
			'past', (
				SELECT IF(COUNT(meetID) = 0, JSON_ARRAY(), JSON_ARRAYAGG(
					JSON_OBJECT(
						'meetID', HEX(meetID),
						'meetTitle', meetTitle,
						'durationInMin', durationInMin,
						'meetDesc', meetDesc,
						'invitee', JSON_OBJECT(
							'userID', HEX(invitee.userID),
							'email', invitee.email,
							'firstName', invitee.firstName,
							'lastName', invitee.lastName
						),
						'host', JSON_OBJECT(
							'userID', HEX(host.userID),
							'email', host.email,
							'firstName', host.firstName,
							'lastName', host.lastName
						),
						'schedule', JSON_OBJECT(
							'date', scheduledDate,
							'time', DATE_FORMAT(scheduledTime, '%H:%i'),
							'place', meetingLinkOrPhone,
							'mediumID', sm.mediumID
						)
					)
				)) AS list FROM Meets AS m
				JOIN MeetMediums AS mm USING (meetID)
				JOIN ScheduledMeets AS sm USING (meetID, mediumID)
				JOIN Mediums AS md USING (mediumID)
				JOIN Users AS invitee ON m.inviteeID = invitee.userID
				JOIN Users AS host ON m.hostID = host.userID
				WHERE ${userTypeCondition} AND CONCAT(scheduledDate, ' ', scheduledTime) < CURRENT_TIMESTAMP()
				ORDER BY m.createdOn DESC ${limitClause}
			)
		) AS list;
	`,
		filters.as === "both"
			? [userID, userID, userID, userID]
			: [userID, userID],
	);

	if (validateDbResp(results)) {
		return results[0];
	}
	throw new Error("Unable to fetch meets.");
}

module.exports = {
	createMeet,
	updateMeetDetails,
	fetchMeetDetails,
	removeMeet,
	scheduleMeet,
	cancelMeetInDb,
	setMeetMediums,
	fetchMeetsByUserID,
};
