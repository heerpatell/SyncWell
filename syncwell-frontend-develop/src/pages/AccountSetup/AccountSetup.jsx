import React, { useState } from "react";
import Footer from "../../components/sections/Footer/Footer";
import LogoWithText from "../../components/layouts/LogoWtext/LogoWithText";
import { ReactComponent as Logosvg } from "../../images/logo.svg";
import Text from "../../components/components/Text";
import { VscVerifiedFilled } from "react-icons/vsc";
import {
	Button,
	FormControl,
	Icon,
	InputLabel,
	TextField,
} from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
// import { useNavigate } from "react-router";
import { RiLoader4Line } from "react-icons/ri";
import { sendRequest } from "../../util";
import { ToastContext } from "../../context/Toast";
import { useNavigate } from "react-router";
import { ChevronLeft } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { Icon as Iconify } from '@iconify/react';
import { AccountSetupForm } from "../../components/layouts/AccountSetupForm";

function AccountSetup() {
	const [availTimeZones, setAvailTimeZones] = useState([]);
	const [countries, setCountries] = useState([]);

	const ToastCtx = React.useContext(ToastContext);

	const [dataState, setDataState] = useState({
		isFetchLoading: true,
		isSubmitLoading: false,
		isError: false,
		info: {
			firstName: "",
			lastName: "",
			timezone: "",
			country: "",
			email: "",
		},
	});

	const originalData = React.useRef({
		country: null,
	});

	React.useEffect(() => {
		sendRequest("users/my-profile", "get").then(res => {
			if (res.userID) {
				originalData.current = res;
				setDataState({
					...dataState,
					isFetchLoading: false,
					isError: false,
					info: {
						firstName: res.firstName,
						lastName: res.lastName,
						timezone: res.timezone,
						country: res.country,
						email: res.email,
					},
				});
			} else {
				ToastCtx.setMsg("Something went wrong. Please try again.");
			}
		});
	}, []);

	return (
		<>
			<div style={{ height: "100vh", position: "relative" }}>
				<div style={{ marginTop: "1.5rem" }}>
					<LogoWithText
						txt="SyncWell"
						txtsize={"h6"}
						logo={Logosvg}
						imgsize={40}
						fontWeight="bold"
					/>
					<hr color="#E1E1E1" style={{ marginTop: "1rem" }} />
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "5rem",
						alignItems: "center",
						marginTop: "4rem",
					}}
				>
					<Text
						txt={
							originalData.current.country
								? "Update your profile"
								: (
									<div style={{
										display: 'flex',
										columnGap: '10px'
									}}>
									<Iconify icon='noto:sparkles' style={{
										fontSize: '30px'
									}} />
									Setup your account
									</div>
								)
						}
						fontWeight={"bold"}
						txtsize={"h5"}
						style={{
							textTransform: "capitalize",
						}}
					/>

					<div>
						{ dataState.isFetchLoading ? '' :
						originalData.current.country  ? (
							""
						) : (
							<div style={{ textAlign: "center", paddingBottom: '30px' }}>
								<Text
									txt={"We just need your basic details"}
									fontWeight={"bold"}
									txtsize={"h5"}
								/>
							</div>
						)}
						{/* <div
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
										padding: '0 10px'
									}
								}}
								onChange={(e) =>
									updateInfo("firstName", e.target.value)
								}
							/>
							<TextField
								id="standard-basic"
								placeholder="Last Name"
								variant="standard"
								value={dataState.info.lastName}
								style={{ width: "50%" }}
								inputProps={{
									style: {
										padding: '0 10px'
									}
								}}
								onChange={(e) =>
									updateInfo("lastName", e.target.value)
								}
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
									onChange={(e) =>
										updateInfo("country", e.target.value)
									}
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
									onChange={(e) =>
										updateInfo("timezone", e.target.value)
									}
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
						</div> */}
						<AccountSetupForm originalData={originalData} dataState={dataState} setDataState={setDataState} />
					</div>

					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.6rem",
						}}
					>
						<VscVerifiedFilled size={23} color="#0FA958" />
						<Text
							txt={
								dataState.isFetchLoading ? '' :
								(originalData.current.country
									? "Your profile is upto date."
									: "Almost Done!")
							}
							// fontWeight={"350"}
							txtsize={"h6"}
							style={{
								color: "#888",
								fontSize: "18px",
							}}
						/>
					</div>
					{
						originalData.current.country ? (
							<Link to='/dashboard'>
							<Button startIcon={
								<ChevronLeft />
							}>Go to Dashboard</Button></Link>
						) : ''
					}
				</div>
				<div style={{ position: "fixed", bottom: "0", width: "100%" }}>
					<Footer />
				</div>
			</div>
		</>
	);
}

export default AccountSetup;
