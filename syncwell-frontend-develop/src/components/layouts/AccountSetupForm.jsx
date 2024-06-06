import {
	Button,
	FormControl,
	Icon,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import React from "react";
import { sendRequest } from "../../util";
import { ToastContext } from "../../context/Toast";
import Text from "../components/Text";
import { RiLoader4Line } from "react-icons/ri";
import { useNavigate } from "react-router";

export function AccountSetupForm({ originalData, dataState, setDataState, onSuccess, token }) {
	const [availTimeZones, setAvailTimeZones] = React.useState([]);
	const [countries, setCountries] = React.useState([]);

	const ToastCtx = React.useContext(ToastContext);

	const updateInfo = (field, value) => {
		if (field === "country") {
			const index = countries.findIndex(
				(country) => country.name.common === value,
			);
			if (index > -1) {
				setAvailTimeZones(countries[index].timezones);
			}
		}
		setDataState({
			...dataState,
			info: {
				...dataState.info,
				[field]: value,
			},
		});
	};

	const navigate = useNavigate();

	const saveDetails = () => {
		setDataState({
			...dataState,
			isSubmitLoading: true,
		});
		sendRequest(`users/my-profile`, "put", dataState.info, token)
			.then((res) => {
				if (!res.userID) throw new Error();
				ToastCtx.setMsg("Profile updated successfully.");
				localStorage.setItem("user", JSON.stringify({
					...dataState.info,
					...res
				}));
				if (onSuccess) {
					onSuccess(res);
					return;
				}
				if (!originalData.current.country) navigate("/dashboard");
			})
			.catch((err) => {
				console.log(87, err);
				ToastCtx.setMsg(
					"Unable to update profile. Please try again later.",
				);
			})
			.finally(() => {
				setDataState({
					...dataState,
					isSubmitLoading: false,
				});
			});
	};

	React.useEffect(() => {
		const fetchData = async () => {
			const countriesCall = await fetch(
				"https://restcountries.com/v3.1/all",
			);
			const countries = await countriesCall.json();
			setCountries(
				countries.sort((a, b) =>
					a.name.common.localeCompare(b.name.common),
				),
			);
		};

		fetchData();
	}, []);

	React.useMemo(() => {
		const countryIndex = countries.findIndex(
			(a) => a.name.common === dataState.info.country,
		);
		if (countryIndex > -1) {
			setAvailTimeZones(countries[countryIndex].timezones);
		}
	}, [dataState.info, countries]);

	React.useMemo(() => {
		console.log(143, availTimeZones);
	}, [availTimeZones]);

	return (
		<>
			<div
				style={{
					display: "flex",
					gap: "1rem",
					marginTop: "2rem",
				}}
			>
				<TextField
					id="standard-basic"
					placeholder="First Name"
					variant="standard"
					value={dataState.info.firstName}
					style={{ width: "50%" }}
					inputProps={{
						style: {
							padding: "0 10px",
						},
					}}
					onChange={(e) => updateInfo("firstName", e.target.value)}
				/>
				<TextField
					id="standard-basic"
					placeholder="Last Name"
					variant="standard"
					value={dataState.info.lastName}
					style={{ width: "50%" }}
					inputProps={{
						style: {
							padding: "0 10px",
						},
					}}
					onChange={(e) => updateInfo("lastName", e.target.value)}
				/>
			</div>
			<div
				style={{
					display: "flex",
					gap: "1rem",
					marginTop: "2rem",
				}}
			>
				<FormControl
					style={{
						width: "50%",
					}}
				>
					<InputLabel>Country</InputLabel>
					<Select
						name="country"
						value={dataState.info.country}
						id="standard-basic"
						variant="standard"
						style={{ width: "100%" }}
						label="Country"
						onChange={(e) => updateInfo("country", e.target.value)}
					>
						{countries.map((country) => (
							<MenuItem
								key={country.alpha2Code}
								value={country.name.common}
							>
								<img
									src={country.flags.svg}
									alt={`${country.name.common} flag`}
									style={{
										width: "20px",
										marginRight: "8px",
									}}
								/>
								{country.name.common}
							</MenuItem>
						))}
					</Select>
				</FormControl>
				<FormControl
					style={{
						width: "50%",
					}}
				>
					<InputLabel>Timezone</InputLabel>
					<Select
						name="timezone"
						value={dataState.info.timezone}
						id="standard-basic"
						variant="standard"
						style={{ width: "100%" }}
						label="Timezone"
						onChange={(e) => updateInfo("timezone", e.target.value)}
					>
						{availTimeZones.map((timezone, index) => (
							<MenuItem
								key={`timezone-${index}`}
								value={timezone}
							>
								{timezone}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					paddingTop: "2rem",
				}}
			>
				<div style={{ fontStyle: "italic" }}>
					<Text txt={dataState.info.email} color={"#888"} />
				</div>
				<Button
					style={{
						backgroundColor: "#1F8A8B",
						width: "7rem",
						borderRadius: "0.3rem",
						textAlign: "center",
						padding: "0.6rem",
						margin: "0.4rem",
						float: "right",
						cursor: "pointer",
						color: "white",
					}}
					disabled={dataState.isSubmitLoading}
					onClick={saveDetails}
				>
					{dataState.isSubmitLoading ? (
						<Icon
							style={{ display: "flex" }}
							className="loading-animation"
						>
							<RiLoader4Line />
						</Icon>
					) : (
						"Save"
					)}
				</Button>
			</div>
		</>
	);
}
