const { google } = require("googleapis");
const { fetchOAuthToken } = require("../db/auth");
const { generateUUID } = require("../util");

async function generateGoogleMeetLink(
	db,
	oauth2Client,
	meetDetails,
	{ startTime, endTime },
) {
	const oauthToken = await fetchOAuthToken(db, meetDetails.host.userID);

	await oauth2Client.setCredentials({
		access_token: oauthToken.tokenDetails.accessToken,
		scope: "https://www.googleapis.com/auth/calendar",
		token_type: "Bearer",
		refresh_token: oauthToken.tokenDetails.refreshToken,
		expiry_date: oauthToken.tokenDetails.expiryDate,
	});
	const calendar = google.calendar({
		version: "v3",
		auth: oauth2Client,
	});

	const event = {
		summary: meetDetails.meetTitle,
		description: meetDetails.meetDesc,
		start: {
			dateTime: startTime,
			timeZone: "America/Toronto",
		},
		end: {
			dateTime: endTime,
			timeZone: "America/Toronto",
		},
		attendees: [
			{
				email: meetDetails.invitee.email,
			},
		],
		conferenceData: {
			createRequest: {
				requestId: generateUUID(),
				conferenceSolutionKey: {
					type: "hangoutsMeet",
				},
			},
		},
	};

	const isInserted = await calendar.events.insert({
		calendarId: "primary",
		resource: event,
		conferenceDataVersion: 1,
	});
	if (!isInserted.data.hangoutLink) {
		throw new Error("Unable to generate Google Meet link.");
	}
	return isInserted.data.hangoutLink;
}

module.exports = {
	generateGoogleMeetLink,
};
