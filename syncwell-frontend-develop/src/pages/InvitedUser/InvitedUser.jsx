import React, { useState, useEffect } from "react";
import Navbar from "../../components/sections/Navbar/Navbar";
import Text from "../../components/components/Text";
import "./invitedUser.scss";
import Footer from "../../components/sections/Footer/Footer";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { PiPhoneCallLight } from "react-icons/pi";
import { TbBrandZoom } from "react-icons/tb";
import { SiGooglemeet } from "react-icons/si";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import TimeBorder from "../../components/layouts/DivWithBorder/TimeBorder";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
	DarkGray,
	GreenDark,
	LightGray,
	ShadyGray,
	White,
} from "../../components/components/Color";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { useParams } from "react-router-dom";
import { convert24hrTo12hr, sendRequest } from "../../util";
import { Skeleton } from "@mui/material";
import { ToastContext } from "../../context/Toast";
import { PickersDay } from "@mui/x-date-pickers";
import { AccountSetupForm } from "../../components/layouts/AccountSetupForm";

function FormDialog({
	open,
	onClose,
	inviteeInfo,
	meetID,
	email,
	date,
	time,
	loc,
	phone,
	description,
	bookScheduleFunc,
	showSuccessUIFunc,
	token
}) {
	const [dataState, setDataState] = useState({
		isSubmitLoading: false,
		info: {
			firstName: inviteeInfo.firstName || "",
			lastName: inviteeInfo.lastName || "",
			country: inviteeInfo.country || "",
			timezone: inviteeInfo.timezone || "",
		},
	});

	// const [isLoading, setIsLoading] = React.useState(false);

	// const handleChange = (e) => {
	// 	const { name, value } = e.target;
	// 	setFormData((prevFormData) => ({
	// 		...prevFormData,
	// 		[name]: value,
	// 	}));
	// };

	const ToastCtx = React.useContext(ToastContext);

	// const handleAction = async () => {
	// 	if (
	// 		!formData.firstName ||
	// 		!formData.lastName ||
	// 		!formData.country ||
	// 		!formData.timezone
	// 	) {
	// 		ToastCtx.setMsg(
	// 			"Alll the fields are required to setup your profile.",
	// 		);
	// 		return;
	// 	}

	// 	setIsLoading(true);

	// 	const resp = await sendRequest(`users/${userID}`, "put", {
	// 		...formData,
	// 		timezone: 'America/Toronto',
	// 	});

	// 	// console.log(69, resp);
	// 	console.log(date, userID, loc, time, description, phone);

	// if (resp.userID) {
	// 	onClose();
	// 	const resp = await bookScheduleFunc(
	// 		date,
	// 		time,
	// 		loc,
	// 		phone,
	// 		description,
	// 	);
	// 	if (resp.meetID === meetID) {
	// 		showSuccessUIFunc();
	// 	} else ToastCtx.setMsg("Unable to locate the scheduled meeting.");
	// } else ToastCtx.setMsg("Unable to update user details.");
	// };

	const handleSuccess = async (res) => {
		if (res.userID) {
			onClose();
			const resp = await bookScheduleFunc(
				date,
				time,
				loc,
				phone,
				description,
			);
			if (resp.meetID === meetID) {
				showSuccessUIFunc();
			} else ToastCtx.setMsg("Unable to locate the scheduled meeting.");
		} else ToastCtx.setMsg("Unable to update user details.");
	};

	// useEffect(() => {
	// 	const token = params.get("token") || "";
	// 	if (!token) {
	// 		setDataState({
	// 			...dataState,
	// 			isError: true,
	// 		});
	// 		return;
	// 	}
	// 	localStorage.setItem("token", atob(token));
	// }, []);

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogContent>
				{dataState.isError ? (
					<div style={{
						display: 'flex',
						flexDirection: 'column',
						rowGap: '20px',
						padding: '16px'
					}}>
					<Text txt='Oops!' txtsize='h5' style={{
						color: '#1F8B8B',
						fontWeight: 'bold'
					}} />
					<Text
						txt="Something went wrong while validating your token."
						txtsize="body1"
						style={{
							color: '#888'
						}}
					/>
					</div>
				) : (
					<>
						<Typography
							variant="h6"
							gutterBottom
							style={{ marginBottom: "2rem" }}
						>
							We just need your basic details
						</Typography>
						<AccountSetupForm
							originalData={{
								current: {
									country: "",
								},
							}}
							dataState={dataState}
							setDataState={setDataState}
							onSuccess={handleSuccess}
							token={token}
						/>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

function InvitedUser() {
	const [location, setLocation] = React.useState(0);
	const [date, setDate] = React.useState(null);
	// const [sectionVisible, setSectionVisible] = useState(false);
	const [selectedTime, setSelectedTime] = useState(null);
	const [open, setOpen] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [description, setDescription] = useState("");
	const [isBookingSucceed, setIsBookingSucceed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [meetDetails, setMeetDetails] = React.useState({
		isLoading: true,
		isError: null,
		data: {},
	});

	const queryParams = new URLSearchParams(window.location.search);

	const [highlightedDays, setHighlightedDays] = React.useState([]);

	const [showAvailableTimeSlots, setShowAvailableTimeSlots] = React.useState(
		[],
	);

	const handleTimeClick = (time) => {
		if (selectedTime === time) setSelectedTime(null);
		else setSelectedTime(time);
	};

	const dayNamesToIndex = {
		sun: 0,
		mon: 1,
		tue: 2,
		wed: 3,
		thu: 4,
		fri: 5,
		sat: 6,
	};
	const dayIndexToNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

	const handleChange = (event) => {
		setLocation(event.target.value);
	};

	const minToMilisec = (num) => num * 60 * 1000;

	const getTimeSlotsFromTimeRange = (availableTimes, durationInMin) => {
		const timeSlots = [];
		for (let timeDuration of availableTimes) {
			console.log(
				170,
				"2001-01-01T" + timeDuration.startTime,
				"2001-01-01T" + timeDuration.endTime,
			);
			let startTime = new Date("2001-01-01T" + timeDuration.startTime);
			let endTime = new Date("2001-01-01T" + timeDuration.endTime);
			const numberOfPossibleGaps = Math.floor(
				new Date(endTime.getTime() - startTime.getTime()).getTime() /
					minToMilisec(durationInMin),
			);
			for (let i = 0; i < numberOfPossibleGaps; i++) {
				timeSlots.push(
					startTime.getHours().toString().padStart(2, 0) +
						":" +
						startTime.getMinutes().toString().padStart(2, 0) +
						":" +
						startTime.getSeconds().toString().padStart(2, 0),
				);
				startTime = new Date(
					startTime.getTime() + minToMilisec(durationInMin),
				);
			}
		}
		console.log(174, timeSlots);
		return timeSlots;
	};

	const formatDate = (year, month, date) => year + "-" + month + "-" + date;

	// const extractDateFromDateJS = (dateObj) => ({
	// 	year: dateObj.year(),
	// 	month: dateObj.month(),
	// 	date: dateObj.date(),
	// })

	const handleDateChange = (newDate) => {
		setShowAvailableTimeSlots([]);
		if (
			!!date &&
			formatDate(date.year(), date.month(), date.date()) ===
				formatDate(newDate.year(), newDate.month(), newDate.date())
		) {
			setDate(null);
		} else {
			setDate(newDate);
			const selectedDate = {
				date: newDate.date().toString().padStart(2, 0),
				month: (newDate.month() + 1).toString().padStart(2, 0),
				year: newDate.year(),
				day: newDate.day(),
			};
			let availableTimes = meetDetails.data.hostAvailability.dates.filter(
				(a) =>
					a.date ===
					formatDate(
						selectedDate.year,
						selectedDate.month,
						selectedDate.date,
					),
			);

			if (
				(!Array.isArray(availableTimes) ||
					(Array.isArray(availableTimes) &&
						!availableTimes.length)) &&
				Array.isArray(
					meetDetails.data.hostAvailability[
						dayIndexToNames[selectedDate.day]
					],
				)
			) {
				availableTimes =
					meetDetails.data.hostAvailability[
						dayIndexToNames[selectedDate.day]
					];
			}
			setShowAvailableTimeSlots(
				getTimeSlotsFromTimeRange(
					availableTimes,
					meetDetails.data.durationInMin,
				),
			);
		}
	};

	const bookSchedule = async (
		date,
		selectedTime,
		location,
		phoneNumber,
		description,
	) => {
		console.log(333, queryParams.get('token') || '');
		return await sendRequest(`meets/${params.meetID}/book`, "put", {
			scheduledDate:
				date.year() +
				"-" +
				(date.month() + 1).toString().padStart(2, 0) +
				"-" +
				date.date().toString().padStart(2, 0),
			scheduledTime: selectedTime,
			mediumID: location,
			phone: phoneNumber,
			msgFromInvitee: description,
		}, atob(queryParams.get('token') || '')).catch(() => {
			if (location == 2)
				ToastCtx.setMsg(
					"Unable to generate a Google Meet link. Contact the host for the link.",
				);
			else
				ToastCtx.setMsg(
					"Unable to book the schedule. Please try again later.",
				);
			return {
				meetID: "",
			};
		});
	};

	const showSuccessUI = () => {
		setIsBookingSucceed(true);
	};

	const handleOpenDialog = async () => {
		if (!params.meetID) return;
		if (!date || !selectedTime || !location) {
			ToastCtx.setMsg(
				"Please select a valid date, time slot and location to proceed.",
			);
			return;
		}

		if (!meetDetails.data.invitee?.country) {
			setOpen(true);
			return;
		}
		setIsLoading(true);

		const resp = await bookSchedule(
			date,
			selectedTime,
			location,
			phoneNumber,
			description,
		);
		if (resp.meetID === params.meetID) {
			showSuccessUI();
		}
		setIsLoading(false);
	};
	const handleCloseDialog = () => {
		setOpen(false);
		setDate(dayjs());
		setSelectedTime(null);
		setLocation("");
		setDescription("");
	};
	const handleDesc = (e) => {
		setDescription(e.target.value);
	};
	const params = useParams();

	const ToastCtx = React.useContext(ToastContext);

	const extractDatesFromGivenDay = (dayAvailability, dayIndex, mm, yyyy) => {
		const dates = [...Array(32).keys()].splice(1);
		return dates.filter((dd) => {
			const date = new Date(yyyy, mm, dd);
			return mm === date.getMonth() && dayIndex === date.getDay();
		});
	};

	const extractDatesFromDates = (availability, mm, yyyy) =>
		availability
			.filter((item) => {
				const d = new Date(item.date + "T00:00:00");
				return (
					item.startTime !== "00:00" &&
					d.getMonth() === mm &&
					d.getFullYear() === yyyy
				);
			})
			.map((item) => {
				const d = new Date(item.date + "T00:00:00");
				return d.getDate();
			});

	const getDatesFromDayForGivenMonth = (availability, mm, yyyy) => {
		const weekAvailabilities = JSON.parse(JSON.stringify(availability));
		delete weekAvailabilities["dates"];

		const extractedDates = [];
		
		for (let dayAvailability in weekAvailabilities) {
			if (weekAvailabilities[dayAvailability].length) {
				extractedDates.push(
					...extractDatesFromGivenDay(
						weekAvailabilities[dayAvailability],
						dayNamesToIndex[dayAvailability],
						mm,
						yyyy,
					),
				);
			}
		}
		
		let updatedDates = [ ...extractedDates ];


		if (Array.isArray(availability.dates) && availability.dates.length) {
			const getHolidayDates = availability.dates
				.filter((a) => a.startTime === "00:00")
				.map((a) => new Date(a.date + "T00:00:00").getDate());
			
			console.log(450, getHolidayDates, extractedDates);
			updatedDates = extractedDates.filter(
				(item) => !getHolidayDates.includes(item),
			);
			const dates = extractDatesFromDates(availability.dates, mm, yyyy);
			updatedDates.push(...dates);
			
		}

		console.log(453, updatedDates, extractedDates);

		return updatedDates;
	};

	React.useEffect(() => {
		if (params?.meetID) {
			sendRequest(`meets/${params.meetID}`, "get", {}, atob(queryParams.get('token') || '')).then((resp) => {
				if (resp?.meetID === params.meetID.toUpperCase() || "") {
					setMeetDetails({
						isLoading: false,
						error: null,
						data: resp,
					});

					if (!resp)
						throw new Error("Unable to fetch meeting details.");

					// if (resp?.scheduledDetails?.scheduledDate && resp?.scheduledDetails?.scheduledTime) {
					// 	setIsBookingSucceed(true);
					// 	return;
					// }

					if (
						Array.isArray(resp.mediums) &&
						resp.mediums.length &&
						resp.mediums.length == 1
					) {
						setLocation(resp.mediums[0].mediumID);
					}

					if (resp.hostAvailability) {
						const d = new Date();
						setHighlightedDays(
							getDatesFromDayForGivenMonth(
								resp.hostAvailability,
								d.getMonth(),
								d.getFullYear(),
							),
						);
					}
				} else
					throw new Error(
						"Either meeting link is expired or deleted by the host.",
					);
			})
			.catch((err) => {
				ToastCtx.setMsg(err.toString());
				setMeetDetails({
					isLoading: false,
					isError: true,
					data: {},
				});
			});
		}
	}, []);

	const getMediumImage = (mediumID) => {
		if (mediumID == 1) {
			return <PiPhoneCallLight />;
		} else if (mediumID == 2) {
			return <SiGooglemeet />;
		} else if (mediumID == 3) {
			return <TbBrandZoom />;
		}
	};

	const highlightDay = (props) => {
		const { highlightedDays } = props;
		// console.log(props, highlightedDays);
		const isSelected =
			!props.outsideCurrentMonth &&
			highlightedDays.indexOf(props.day.date()) >= 0;
		return (
			<PickersDay
				{...props}
				style={{
					background: isSelected ? "#DDD" : "inherit",
					// color: isSelected ? 'white' : 'inherit',
				}}
			/>
		);
	};

	const handleMonthOrYearChange = (d) => {
		setHighlightedDays(
			getDatesFromDayForGivenMonth(
				meetDetails.data.hostAvailability,
				d.month(),
				d.year(),
			),
		);
	};

	return (
		<>
			<div className="outerInvitedUser">
				<div className="section-1-invitedUser">
					<Navbar />
					<hr color={ShadyGray} />
				</div>
				{isBookingSucceed ? (
					<div
						style={{
							height: "calc(100vh - 290px)",
							margin: "80px",
							display: "flex",
							flexDirection: "column",
							rowGap: "50px",
						}}
					>
						<Text
							txt="Thank You!"
							txtsize="h4"
							fontWeight="bold"
							style={{ color: GreenDark }}
						/>
						<Text
							txt="Your meeting is scheduled. We wish you a good time with us."
							txtsize="h6"
						/>
					</div>
				) : (
					<div
						className="inviteduser-body"
						style={{
							height: "650px",
						}}
					>
						{meetDetails.isLoading ? (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									rowGap: "20px",
								}}
							>
								<Skeleton
									variant="rectangular"
									width="100%"
									height={34}
								/>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										columnGap: "20px",
									}}
								>
									<Skeleton
										variant="rectangular"
										width={300}
										height={24}
									/>
									<Skeleton
										variant="rectangular"
										width={100}
										height={24}
									/>
								</div>
								<Skeleton
									variant="rectangular"
									width="100%"
									height={74}
								/>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										columnGap: "60px",
									}}
								>
									<Skeleton
										variant="rectangular"
										width="33%"
										height={460}
									/>
									<Skeleton
										variant="rectangular"
										width="33%"
										height={460}
									/>
									<Skeleton
										variant="rectangular"
										width="33%"
										height={460}
									/>
								</div>
							</div>
						) : meetDetails.isError ? (
							<Text
								txt={"Oops! Something went wrong."}
								txtsize="h2"
							/>
						) : (
							<>
								<div className="section-2-invitedUser">
									<Text
										txt={meetDetails.data.meetTitle}
										color={DarkGray}
										txtsize={"h6"}
									/>
									<div className="by-who-and-time-row">
										<div className="by-who-time-row-btn">
											<Text
												txt={`${meetDetails?.data?.host?.firstName} ${meetDetails?.data?.host?.lastName}`}
												color={White}
												txtsize={"body2"}
											/>
										</div>
										<Text
											txt={`${meetDetails.data.durationInMin} min`}
											color={GreenDark}
											txtsize={"body2"}
										/>
									</div>
									<div className="inviteduser-description">
										<Text
											txt={meetDetails.data.meetDesc}
											color={DarkGray}
											txtsize={"body2"}
										/>
									</div>
								</div>
								<div className="section-3-date-time-loc">
									<div className="section-3-date">
										<Text
											txt={"Choose a date"}
											txtsize={"h6"}
											color={DarkGray}
										/>
										<LocalizationProvider
											dateAdapter={AdapterDayjs}
										>
											<DemoContainer
												components={[
													"DateCalendar",
													"DateCalendar",
												]}
											>
												<DemoItem>
													<DateCalendar
														value={date}
														onChange={
															handleDateChange
														}
														onMonthChange={
															handleMonthOrYearChange
														}
														onYearChange={
															handleMonthOrYearChange
														}
														disablePast
														views={["day", "month"]}
														slots={{
															day: highlightDay,
														}}
														slotProps={{
															day: {
																highlightedDays,
															},
														}}
														classes={{
															root: "date-picker-root",
														}}
													/>
												</DemoItem>
											</DemoContainer>
										</LocalizationProvider>
									</div>
									<div className="section-3-time">
										{/* <div className="s3-time-heading"> */}
										<div className="by-who-and-time-row">
											<div className="by-who-time-row-btn">
												<Text
													txt={`${meetDetails?.data?.host?.firstName} ${meetDetails?.data?.host?.lastName}`}
													color={White}
													txtsize={"body2"}
												/>
											</div>
											<Text
												txt={"Decide a time"}
												txtsize={"h6"}
												color={DarkGray}
											/>
										</div>
										<div className="s3-time-div">
											<div
												style={{
													overflowY: "scroll",
													maxHeight: "380px",
													marginTop: "30px",
												}}
											>
												{Array.isArray(
													showAvailableTimeSlots,
												) &&
												showAvailableTimeSlots.length ? (
													showAvailableTimeSlots.map(
														(item, index) => (
															<TimeBorder
																key={index}
																selected={
																	item ===
																	selectedTime
																}
																time={convert24hrTo12hr(
																	item,
																)}
																onClick={() =>
																	handleTimeClick(
																		item,
																	)
																}
															/>
														),
													)
												) : (
													<div
														style={{
															paddingTop: "1rem",
														}}
													>
														<Text
															txt={
																"Select an available date to view the available time of the host on that day."
															}
															color={LightGray}
															txtsize={"body2"}
														/>
													</div>
												)}
											</div>
										</div>
									</div>
									<div className="section-3-loc">
										<Text
											txt={"Select a location"}
											txtsize={"h6"}
											color={DarkGray}
										/>
										<FormControl
											variant="standard"
											sx={{ m: 1, minWidth: 120 }}
										>
											{Array.isArray(
												meetDetails.data.mediums,
											) &&
											meetDetails.data.mediums.length ? (
												<Select
													labelId="demo-simple-select-standard-label"
													id="demo-simple-select-standard"
													value={location}
													onChange={handleChange}
													label="Location"
													style={{ width: "100%" }}
												>
													{meetDetails.data.mediums.map(
														(item) => (
															<MenuItem
																key={
																	item.mediumID
																}
																value={
																	item.mediumID
																}
															>
																{getMediumImage(
																	item.mediumID,
																)}{" "}
																&nbsp;&nbsp;{" "}
																{
																	item.mediumName
																}
															</MenuItem>
														),
													)}
												</Select>
											) : (
												""
											)}
											{/* <Select
													labelId="demo-simple-select-standard-label"
													id="demo-simple-select-standard"
													// value={location}
													onChange={handleChange}
													label="Location"
													style={{ width: "100%" }}
												>
													{Array.isArray(
														meetDetails.data.mediums,
													) && meetDetails.data.mediums.length
														? 
														: ""}
												</Select> */}
										</FormControl>
										{location == 1 && (
											<FormControl
												variant="standard"
												sx={{
													m: 2,
													minWidth: 120,
													margin: "15px 0",
												}}
											>
												{location && (
													<PhoneInput
														style={{
															fontFamily:
																"Montserrat",
															// fontSize: '14px',
														}}
														inputStyle={{
															fontSize: "14px",
															padding: "20px",
														}}
														defaultCountry="ca"
														value={phoneNumber}
														onChange={(phone) =>
															setPhoneNumber(
																phone,
															)
														}
													/>
												)}
											</FormControl>
										)}
										<TextField
											style={{ marginTop: "3rem" }}
											placeholder="You can write here something that you want the organizer to know..."
											multiline
											minRows={4}
											maxRows={6}
											InputProps={{
												style: {
													fontSize: "14px",
												},
											}}
											onChange={handleDesc}
											value={description}
										/>
										<Button
											variant="contained"
											style={{
												width: "max-content",
												backgroundColor: GreenDark,
												color: "white",
												marginTop: "60px",
												opacity:
													!date ||
													!selectedTime ||
													!location ||
													(location == 1 &&
														(!phoneNumber ||
															phoneNumber.length <
																10))
														? 0.8
														: 1,
											}}
											disabled={
												!date ||
												!selectedTime ||
												!location ||
												isLoading ||
												(location == 1 &&
													(!phoneNumber ||
														phoneNumber.length <
															10))
											}
											onClick={handleOpenDialog}
										>
											{isLoading
												? "Scheduling..."
												: "Schedule"}
										</Button>
										{/* <div
													style={{
														backgroundColor: GreenDark,
														color: White,
														width: "5rem",
														textAlign: "center",
														padding: "0.5rem",
														borderRadius: "0.3rem",
														margin: "3rem 0",
														cursor: "pointer",
														opacity:
															date && selectedTime && location
																? 1
																: 0.5,
														pointerEvents:
															date && selectedTime && location
																? "auto"
																: "none",
													}}
													onClick={handleOpenDialog}
												>
													Schedule
												</div> */}

										<FormDialog
											open={open}
											onClose={handleCloseDialog}
											bookScheduleFunc={bookSchedule}
											showSuccessUIFunc={showSuccessUI}
											date={date}
											time={selectedTime}
											loc={location}
											phone={phoneNumber}
											description={description}
											inviteeInfo={
												meetDetails?.data?.invitee
											}
											meetID={params.meetID}
											email={
												meetDetails.data.invitee?.email
											}
											token={atob(queryParams.get('token') || '')}
										/>
									</div>
								</div>
							</>
						)}
					</div>
				)}

				<div className="section-4">
					<Footer />
				</div>
			</div>
		</>
	);
}

export default InvitedUser;
