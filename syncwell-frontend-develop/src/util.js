import axios from "axios";
import queryString from "qs";

export async function sendRequest(url, method, data, token) {
	console.log(5, url, method, data, token);
	if (!url || !method)
		throw new Error("Request URL or method does not found.");

	method = method.toLowerCase();

	const headers = {
		"Content-Type": "application/x-www-form-urlencoded",
	};
	
	if (!token) {
		console.log(16, token);
		token = localStorage.getItem("token");
	}
	
	headers.Authorization = `Bearer ${token}`;

	return await axios
		.request({
			method,
			url: `${process.env.REACT_APP_API_HOSTNAME}/${url}`,
			data: queryString.stringify(data),
			headers,
		})
		.then((resp) => resp.data);
}

export function convert24hrTo12hr(timeStr) {
	const timeParts = timeStr.split(":");
	let newHr = timeParts[0];
	let amOrPm = "AM";
	if (timeParts[0] >= 12) {
		newHr = timeParts[0] % 12 || 12;
		amOrPm = "PM";
	}
	return newHr.toString().padStart(2, 0) + ":" + timeParts[1] + " " + amOrPm;
}

export function getFieldFromHostOrInvitee(meetItem, field) {
	const userType =
		meetItem.host.userID === localStorage.getItem("userID")
			? "host"
			: "invitee";
	if (field === "name") {
		if (userType === "host")
			return meetItem.invitee.firstName + " " + meetItem.invitee.lastName;
		else if (userType === "invitee")
			return meetItem.host.firstName + " " + meetItem.host.lastName;
	} else if (field === "email") {
		if (userType === "host") return meetItem.invitee.email;
		else if (userType === "invitee") return meetItem.host.email;
	}
	return "";
}

export function stringToColor(string) {
	let hash = 0;
	let i;

	for (i = 0; i < string.length; i += 1) {
		hash = string.charCodeAt(i) + ((hash << 3) - hash);
	}

	let color = "#";
	for (i = 0; i < 3; i += 1) {
		const value = (hash >> (i * 8)) & 0xff;
		color += `00${value.toString(16)}`.slice(-2);
	}
	return color;
}

export function stringAvatar(name) {
	const parts = name.split(" ");
	return {
		sx: {
			bgcolor: stringToColor(name),
			width: "36px",
			fontSize: "16px",
			height: "36px",
		},
		children: parts.length < 2 ? parts[0][0] : `${parts[0][0]}${parts[1][0]}`,
	};
}

const monthShortForms = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

export function getFormattedDateTime(dateObj) {
	if (typeof dateObj != "object") return "";
	const time = convert24hrTo12hr(
		dateObj.getHours() + ":" + dateObj.getMinutes(),
	);
	return (
		monthShortForms[dateObj.getMonth()] +
		" " +
		dateObj.getDate() +
		", " +
		time
	);
}

export function checkTimeFormat(timeStr) {
	const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
	return timeStr.match(timeRegex);
}
